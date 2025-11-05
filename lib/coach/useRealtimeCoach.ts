'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const REALTIME_SAMPLE_RATE = 24000;
const MIN_COMMIT_DURATION_MS = 320;
const MAX_COMMIT_INTERVAL_MS = 1200;

const estimatePcm16DurationMs = (base64: string): number => {
  if (!base64) return 0;
  const cleanLength = base64.length;
  if (cleanLength === 0) return 0;

  let padding = 0;
  if (base64.endsWith("==")) padding = 2;
  else if (base64.endsWith("=")) padding = 1;

  const bytes = (cleanLength / 4) * 3 - padding;
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return 0;
  }

  const samples = bytes / 2;
  return (samples / REALTIME_SAMPLE_RATE) * 1000;
};

type SpeakerRole = "candidate" | "coach";

export interface TranscriptEntry {
  speaker: SpeakerRole;
  text: string;
  timestamp: number;
}

export interface CoachSessionResult {
  transcript: TranscriptEntry[];
  feedback?: unknown;
}

interface UseRealtimeCoachOptions {
  sessionId?: string;
  autoStart?: boolean;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (result: CoachSessionResult) => void | Promise<void>;
}

interface UseRealtimeCoachReturn {
  status: "idle" | "connecting" | "running" | "ending" | "ended";
  sessionId: string | null;
  transcript: TranscriptEntry[];
  feedback: CoachSessionResult["feedback"];
  isMuted: boolean;
  elapsed: string;
  startTime: number | null;
  endTime: number | null;
  setMuted(next: boolean): void;
  startSession(): Promise<{ ok: boolean; error?: string; sessionId?: string }>;
  finalizeSession(origin?: "manual" | "auto"): Promise<{ ok: boolean; error?: string }>;
  sendText(text: string): Promise<{ ok: boolean; error?: string }>;
}

const resampleBuffer = (data: Float32Array, inputRate: number, targetRate: number): Float32Array => {
  if (inputRate === targetRate) {
    return data;
  }

  const ratio = inputRate / targetRate;
  const newLength = Math.round(data.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i += 1) {
    const sourceIndex = i * ratio;
    const indexInt = Math.floor(sourceIndex);
    const indexFrac = sourceIndex - indexInt;

    const sample1 = data[indexInt] ?? 0;
    const sample2 = data[indexInt + 1] ?? sample1;
    result[i] = sample1 + (sample2 - sample1) * indexFrac;
  }

  return result;
};

const float32ToBase64Pcm = (data: Float32Array): string => {
  const buffer = new ArrayBuffer(data.length * 2);
  const view = new DataView(buffer);

  for (let i = 0; i < data.length; i += 1) {
    let sample = data[i];
    sample = Math.max(-1, Math.min(1, sample));
    view.setInt16(i * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

const decodePcm16Base64 = (base64: string): Float32Array => {
  const binary = atob(base64);
  const length = binary.length;
  const buffer = new ArrayBuffer(length);
  const view = new Uint8Array(buffer);

  for (let i = 0; i < length; i += 1) {
    view[i] = binary.charCodeAt(i);
  }

  const pcm = new Int16Array(buffer);
  const float32 = new Float32Array(pcm.length);

  for (let i = 0; i < pcm.length; i += 1) {
    float32[i] = pcm[i] / 32768;
  }

  return float32;
};

export function useRealtimeCoach(options?: UseRealtimeCoachOptions): UseRealtimeCoachReturn {
  const [status, setStatus] = useState<UseRealtimeCoachReturn["status"]>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [feedback, setFeedback] = useState<CoachSessionResult["feedback"]>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const finalizingRef = useRef<boolean>(false);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const micGainRef = useRef<GainNode | null>(null);
  const audioUploadQueueRef = useRef<Promise<void>>(Promise.resolve());
  const audioBufferStateRef = useRef<{ bufferedMs: number; lastCommitTs: number }>({
    bufferedMs: 0,
    lastCommitTs: 0
  });
  const sessionIdRef = useRef<string | null>(null);
  const audioErrorNotifiedRef = useRef<boolean>(false);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const playbackTimeRef = useRef<number>(0);
  const isMutedRef = useRef<boolean>(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const elapsed = useMemo(() => {
    if (!startTime) return "00:00";
    const reference = status === "running" || status === "ending" ? now : endTime ?? now;
    const diff = reference - startTime;
    if (diff <= 0) return "00:00";
    const minutes = Math.floor(diff / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [now, startTime, status, endTime]);

  const cleanupEventSource = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
  }, []);

  const stopMicrophoneCapture = useCallback(() => {
    micProcessorRef.current?.disconnect();
    micProcessorRef.current = null;

    micSourceRef.current?.disconnect();
    micSourceRef.current = null;

    micGainRef.current?.disconnect();
    micGainRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {
        /* ignore */
      });
      audioContextRef.current = null;
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
  }, []);

  const commitBufferedAudio = useCallback(
    async (session: string, reason: "threshold" | "flush") => {
      if (!session) return;

      const response = await fetch("/api/coach/fcl055d/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const message = typeof payload?.error === "string" ? payload.error : "Échec du commit audio";

        if (/conversation_already_has_active_response/i.test(message)) {
          console.warn(`Commit différé: réponse déjà en cours (${reason})`);
          const state = audioBufferStateRef.current;
          state.bufferedMs = 0;
          state.lastCommitTs = Date.now();
          return;
        }

        if (/buffer too small/i.test(message)) {
          const state = audioBufferStateRef.current;
          console.warn(
            `Commit ignoré (buffer insuffisant, tampon ≈${state.bufferedMs.toFixed(0)}ms, raison: ${reason})`
          );
          return;
        }

        throw new Error(message);
      }

      const state = audioBufferStateRef.current;
      state.bufferedMs = 0;
      state.lastCommitTs = Date.now();
    },
    []
  );

  const enqueueAudioChunk = useCallback((id: string, base64: string) => {
    if (!id || !base64) return;

    audioUploadQueueRef.current = audioUploadQueueRef.current
      .catch(() => {
        /* swallow previous error to keep chain alive */
      })
      .then(async () => {
        try {
          const audioRes = await fetch("/api/coach/fcl055d/audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: id, audio: base64 })
          });

          if (!audioRes.ok) {
            const payload = await audioRes.json().catch(() => ({}));
            const message = typeof payload?.error === "string" ? payload.error : "Échec de l'envoi audio";

            if (/coach non connecté|session inconnue/i.test(message)) {
              throw new Error(message);
            }

            console.warn("Append audio ignoré:", message);
            return;
          }

          const chunkDuration = estimatePcm16DurationMs(base64);
          const state = audioBufferStateRef.current;
          state.bufferedMs += chunkDuration;

          const now = Date.now();
          if (state.lastCommitTs === 0) {
            state.lastCommitTs = now;
          }

          const elapsed = now - state.lastCommitTs;
          const shouldCommit =
            state.bufferedMs >= MIN_COMMIT_DURATION_MS ||
            elapsed >= MAX_COMMIT_INTERVAL_MS;

          if (shouldCommit) {
            await commitBufferedAudio(id, "threshold");
          }
        } catch (error) {
          if (
            error instanceof Error &&
            /conversation_already_has_active_response|buffer too small/i.test(error.message)
          ) {
            console.warn("Avertissement audio coach:", error.message);
            return;
          }

          console.error("Erreur d'envoi audio vers le coach", error);
          if (!audioErrorNotifiedRef.current) {
            audioErrorNotifiedRef.current = true;
            toast.error("Transmission audio impossible. Vérifiez votre connexion.");
          }
        }
      });
  }, [commitBufferedAudio]);

  const flushBufferedAudio = useCallback(
    async (id: string | null) => {
      if (!id) return;

      audioUploadQueueRef.current = audioUploadQueueRef.current
        .catch(() => {
          /* ignore previous error to keep chain alive */
        })
        .then(async () => {
          if (audioBufferStateRef.current.bufferedMs <= 0) {
            return;
          }

          try {
            await commitBufferedAudio(id, "flush");
          } catch (error) {
            console.warn("Flush audio impossible", error);
          }
        });

      await audioUploadQueueRef.current;
    },
    [commitBufferedAudio]
  );

  const startMicrophoneCapture = useCallback(
    async (id: string) => {
      audioErrorNotifiedRef.current = false;

      if (!navigator.mediaDevices?.getUserMedia) {
        toast.error("Le navigateur ne supporte pas la capture micro.");
        return false;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioStreamRef.current = stream;

        let ctx = audioContextRef.current;
        if (!ctx) {
          try {
            ctx = new AudioContext({ sampleRate: REALTIME_SAMPLE_RATE });
          } catch (error) {
            console.warn("AudioContext sample rate non supporté, utilisation par défaut", error);
            ctx = new AudioContext();
          }
          audioContextRef.current = ctx;
        }

        const source = ctx.createMediaStreamSource(stream);
        micSourceRef.current = source;

        const processor = ctx.createScriptProcessor(4096, 1, 1);
        micProcessorRef.current = processor;

        const gain = ctx.createGain();
        gain.gain.value = 0;
        micGainRef.current = gain;

        processor.onaudioprocess = (event) => {
          if (sessionIdRef.current !== id) return;
          if (isMutedRef.current) return;
          const input = event.inputBuffer.getChannelData(0);
          if (!input || input.length === 0) return;
          const processed = resampleBuffer(input, ctx.sampleRate, REALTIME_SAMPLE_RATE);
          const base64 = float32ToBase64Pcm(processed);
          enqueueAudioChunk(id, base64);
        };

        source.connect(processor);
        processor.connect(gain);
        gain.connect(ctx.destination);

        return true;
      } catch (error) {
        console.error("Erreur d'accès au micro", error);
        toast.error("Impossible d'accéder au micro. Mode texte uniquement.");
        return false;
      }
    },
    [enqueueAudioChunk]
  );

  const playAssistantAudio = useCallback((base64: string) => {
    if (!base64) return;

    try {
      let ctx = playbackContextRef.current;
      if (!ctx) {
        try {
          ctx = new AudioContext({ sampleRate: REALTIME_SAMPLE_RATE });
        } catch (error) {
          console.warn("AudioContext sample rate non supporté, utilisation par défaut", error);
          ctx = new AudioContext();
        }
        playbackContextRef.current = ctx;
        playbackTimeRef.current = ctx.currentTime;
      }

      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {
          /* ignore resume errors */
        });
      }

      const samples = decodePcm16Base64(base64);
      const buffer = ctx.createBuffer(1, samples.length, REALTIME_SAMPLE_RATE);
      buffer.getChannelData(0).set(samples);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const startAt = Math.max(playbackTimeRef.current, ctx.currentTime);
      source.start(startAt);
      playbackTimeRef.current = startAt + buffer.duration;
    } catch (error) {
      console.error("Lecture audio échouée", error);
    }
  }, []);

  const resetState = useCallback(() => {
    stopMicrophoneCapture();
    setTranscript([]);
    setFeedback(null);
    setStartTime(null);
    setEndTime(null);
    setSessionId(null);
    sessionIdRef.current = null;
    audioUploadQueueRef.current = Promise.resolve();
    audioBufferStateRef.current = { bufferedMs: 0, lastCommitTs: 0 };
    audioErrorNotifiedRef.current = false;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {
        /* ignore */
      });
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {
        /* ignore */
      });
      playbackContextRef.current = null;
      playbackTimeRef.current = 0;
    }
  }, [stopMicrophoneCapture]);

  const finalizeSession = useCallback(
    async (origin: "manual" | "auto" = "manual") => {
      const currentId = sessionIdRef.current ?? sessionId;
      if (!currentId || finalizingRef.current) {
        return { ok: false, error: "Aucune session active." };
      }

      stopMicrophoneCapture();
      finalizingRef.current = true;
      setStatus("ending");

      await flushBufferedAudio(currentId);

      try {
        const response = await fetch("/api/coach/fcl055d/end", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentId })
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error ?? "Erreur de clôture de session.");
        }

        const result = payload?.result as CoachSessionResult | undefined;
        if (result?.transcript) {
          setTranscript(
            result.transcript.map((turn: any) => ({
              speaker: turn.role === "coach" ? "coach" : "candidate",
              text: turn.text,
              timestamp: new Date(turn.timestamp).getTime()
            }))
          );
        }
        if (result?.feedback) {
          setFeedback(result.feedback);
        }

        await options?.onSessionEnd?.(result ?? { transcript: [] });

        toast.success("Session terminée", {
          description:
            origin === "manual"
              ? "Feedback généré avec succès."
              : "Session clôturée automatiquement."
        });

        cleanupEventSource();
        setStatus("ended");
        setEndTime(Date.now());
        sessionIdRef.current = null;
        setSessionId(null);

        if (playbackContextRef.current) {
          playbackContextRef.current.close().catch(() => {
            /* ignore */
          });
          playbackContextRef.current = null;
          playbackTimeRef.current = 0;
        }

        return { ok: true };
      } catch (error) {
        console.error(error);
        toast.error("Impossible de clôturer la session.", {
          description: error instanceof Error ? error.message : undefined
        });
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
      } finally {
        finalizingRef.current = false;
        audioBufferStateRef.current = { bufferedMs: 0, lastCommitTs: 0 };
        audioUploadQueueRef.current = Promise.resolve();
      }
    },
    [cleanupEventSource, flushBufferedAudio, options, sessionId, stopMicrophoneCapture]
  );

  const handleCoachEvent = useCallback(
    (payload: Record<string, unknown>) => {
      if (!payload) return;

      if (payload.type === "transcript") {
        const role = (payload.role as string) === "coach" ? "coach" : "candidate";
        const text = typeof payload.text === "string" ? payload.text : "";
        if (!text) return;
        const ts =
          typeof payload.timestamp === "string"
            ? new Date(payload.timestamp).getTime()
            : Date.now();
        setTranscript((prev) => [...prev, { speaker: role, text, timestamp: ts }]);
      }

      if (payload.type === "audio.delta") {
        const audio = typeof payload.audio === "string" ? payload.audio : null;
        if (audio) {
          playAssistantAudio(audio);
        }
      }

      if (payload.type === "session.end") {
        toast.message("Session en cours de clôture", {
          description: "Génération du feedback..."
        });
        void finalizeSession("auto");
      }
    },
    [finalizeSession, playAssistantAudio]
  );

  const attachEventStream = useCallback(
    (id: string) => {
      cleanupEventSource();
      const source = new EventSource(`/api/coach/fcl055d/events?sessionId=${id}`);
      source.onmessage = (event) => {
        if (!event.data) return;
        try {
          const payload = JSON.parse(event.data) as Record<string, unknown>;
          handleCoachEvent(payload);
        } catch (error) {
          console.error("Erreur de parsing SSE", error);
        }
      };
      source.onerror = (error) => {
        console.error("SSE error", error);
        source.close();
        eventSourceRef.current = null;
        toast.error("Flux d'évènements interrompu.");
      };

      eventSourceRef.current = source;
    },
    [cleanupEventSource, handleCoachEvent]
  );

  const startSession = useCallback(async () => {
    if (status === "connecting" || status === "running") {
      return { ok: false, error: "Une session est déjà en cours." };
    }

    setStatus("connecting");
    setTranscript([]);
    setFeedback(null);
    setStartTime(null);
    setEndTime(null);
    audioUploadQueueRef.current = Promise.resolve();
    audioErrorNotifiedRef.current = false;

    const providedId = options?.sessionId;
    const newSessionId = providedId ?? crypto.randomUUID();

    try {
      const startResponse = await fetch("/api/coach/fcl055d/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: newSessionId })
      });

      const payload = await startResponse.json();
      if (!startResponse.ok) {
        throw new Error(payload?.error ?? "Impossible de démarrer la session coach.");
      }

      if (payload?.ok === false) {
        const warning: string | undefined = payload?.warning;
        if (warning) {
          toast.warning(warning);
        } else {
          toast.warning("Coach IA indisponible (configuration OpenAI invalide).");
        }
        setStatus("idle");
        resetState();
        return { ok: false, error: warning ?? "Configuration OpenAI invalide." };
      }

      sessionIdRef.current = newSessionId;
      setSessionId(newSessionId);
      options?.onSessionStart?.(newSessionId);

      attachEventStream(newSessionId);

      audioBufferStateRef.current = {
        bufferedMs: 0,
        lastCommitTs: Date.now()
      };

      const micStarted = await startMicrophoneCapture(newSessionId);
      if (!micStarted) {
        toast.message("Coach en mode texte", {
          description: "Le micro n'est pas disponible. Vous pouvez taper vos réponses."
        });
      }

      setStartTime(Date.now());
      setEndTime(null);
      setStatus("running");
      toast.success("Session prête", {
        description: "Coach IA connecté, transcript en direct."
      });

      return { ok: true, sessionId: newSessionId };
    } catch (error) {
      console.error(error);
      toast.error("Impossible de démarrer la session.", {
        description: error instanceof Error ? error.message : undefined
      });
      setStatus("idle");
      resetState();
      return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
  }, [attachEventStream, options, resetState, startMicrophoneCapture, status]);

  const sendText = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return { ok: false, error: "Le texte est vide." };

      const currentId = sessionIdRef.current ?? sessionId;
      if (!currentId) return { ok: false, error: "Aucune session active." };

      try {
        const response = await fetch("/api/coach/fcl055d/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: currentId, text: trimmed })
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload?.error ?? "Message non envoyé.");
        }

        return { ok: true };
      } catch (error) {
        console.error(error);
        toast.error("Impossible d'envoyer le message.", {
          description: error instanceof Error ? error.message : undefined
        });
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
      }
    },
    [sessionId]
  );

  useEffect(() => {
    if (status === "running") {
      setNow(Date.now());
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setNow(Date.now());
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [status]);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    if (options?.autoStart) {
      void startSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.autoStart]);

  useEffect(
    () => () => {
      cleanupEventSource();
      stopMicrophoneCapture();
      if (playbackContextRef.current) {
        playbackContextRef.current.close().catch(() => {
          /* ignore */
        });
        playbackContextRef.current = null;
        playbackTimeRef.current = 0;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    },
    [cleanupEventSource, stopMicrophoneCapture]
  );

  return {
    status,
    sessionId,
    transcript,
    feedback,
    isMuted,
    elapsed,
    startTime,
    endTime,
    setMuted: setIsMuted,
    startSession,
    finalizeSession,
    sendText
  };
}
