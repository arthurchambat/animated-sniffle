"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type TranscriptEntry = {
  speaker: "candidate" | "avatar";
  text: string;
  timestamp: number;
};

export function RealtimeSession() {
  const [status, setStatus] = useState<"idle" | "connecting" | "running" | "ended">("idle");
  const [token, setToken] = useState<string | null>(null);
  const [beyondPresenceSession, setBeyondPresenceSession] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const elapsed = useMemo(() => {
    if (!startTime || status !== "running") return "00:00";
    const diff = Date.now() - startTime;
    const minutes = Math.floor(diff / 60000)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor((diff % 60000) / 1000)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [startTime, status]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const simulateTranscript = () => {
    intervalRef.current = setInterval(() => {
      setTranscript((prev) => [
        ...prev,
        {
          speaker: prev.length % 2 === 0 ? "avatar" : "candidate",
          text:
            prev.length % 2 === 0
              ? "Peux-tu détailler le bridge financing sur ta dernière transaction ?"
              : "Nous avons structuré un bridge de 1.2bn EUR avec amortissement bullet sur 12 mois.",
          timestamp: Date.now()
        }
      ]);
    }, 4500);
  };

  const startSession = async () => {
    setStatus("connecting");
    try {
      const [tokenRes, beyRes] = await Promise.all([
        fetch("/api/token/realtime", { method: "POST" }),
        fetch("/api/bey/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ persona: "ib_avatar_fr", locale: "fr-FR" })
        })
      ]);

      if (!tokenRes.ok) throw new Error("Token Realtime indisponible");
      const tokenPayload = await tokenRes.json();
      setToken(tokenPayload.token);

      if (!beyRes.ok) throw new Error("Beyond Presence indisponible");
      const beyPayload = await beyRes.json();
      setBeyondPresenceSession(beyPayload.sessionId);

      toast.success("Session prête", {
        description: "Avatar connecté, audio bidirectionnel activé."
      });

      setStartTime(Date.now());
      setStatus("running");
      simulateTranscript();
    } catch (error) {
      console.error(error);
      toast.error("Impossible de démarrer la session.");
      setStatus("idle");
    }
  };

  const endSession = () => {
    setStatus("ended");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    toast.message("Session terminée", {
      description: "Génération du scoring et du feedback en cours."
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="bento-card aspect-video overflow-hidden p-0">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
          {!beyondPresenceSession ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm text-slate-300">
              Avatar Beyond Presence en cours de connexion...
            </div>
          ) : null}
        </div>
        <div className="bento-card flex items-center justify-between p-4">
          <div className="flex items-center gap-4 text-sm text-slate-200">
            <span className="inline-flex h-3 w-3 animate-pulse rounded-full bg-emerald-400" />
            <span>Statut : {status === "running" ? "En session" : status}</span>
            <span>Chrono : {elapsed}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleMicCheck}>
              Tester micro
            </Button>
            {status === "running" ? (
              <Button variant="outline" onClick={endSession}>
                Terminer et générer feedback
              </Button>
            ) : (
              <Button onClick={startSession} disabled={status === "connecting"}>
                {status === "connecting" ? "Connexion..." : "Démarrer la session"}
              </Button>
            )}
          </div>
        </div>
        <audio ref={audioRef} autoPlay className="hidden" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="bento-card p-4">
          <h3 className="text-sm font-semibold text-slate-100">Transcript live</h3>
          <div className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto text-sm text-slate-200">
            {transcript.map((entry, index) => (
              <div key={`${entry.timestamp}-${index}`} className="rounded-lg bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                  {entry.speaker === "candidate" ? "Vous" : "Avatar"}
                  <span className="ml-2 text-slate-500">
                    {new Date(entry.timestamp).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit"
                    })}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-100">{entry.text}</p>
              </div>
            ))}
            {transcript.length === 0 ? (
              <p className="text-xs text-slate-400">Transcript en attente...</p>
            ) : null}
          </div>
        </div>
        <div className="bento-card p-4">
          <h3 className="text-sm font-semibold text-slate-100">Notes personnelles</h3>
          <textarea
            className="h-40 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
            placeholder="Prenez vos notes, timestamp automatique."
          />
        </div>
      </div>
    </div>
  );
}

function handleMicCheck() {
  if (!navigator.mediaDevices?.getUserMedia) {
    toast.error("Accès micro indisponible sur ce navigateur.");
    return;
  }
  toast.message("Test micro", {
    description: "Accordez la permission micro et parlez pour vérifier le niveau.",
    action: {
      label: "Accorder",
      onClick: async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach((track) => track.stop());
          toast.success("Micro détecté !");
        } catch (error) {
          console.error(error);
          toast.error("Impossible d'accéder au micro.");
        }
      }
    }
  });
}
