"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRealtimeCoach } from "@/lib/coach/useRealtimeCoach";
import type { TranscriptEntry } from "@/lib/coach/useRealtimeCoach";

type CoachFeedback = {
  summary?: string;
  strengths?: string[];
  improvements?: string[];
  recommendations?: string[];
  raw?: string;
} | null;

export function RealtimeSession() {
  const {
    status,
    transcript,
    feedback: rawFeedback,
    elapsed,
    startSession: startCoachSession,
    finalizeSession: finalizeCoachSession,
    sendText
  } = useRealtimeCoach();

  const [beyondPresenceSession, setBeyondPresenceSession] = useState<string | null>(null);
  const [composer, setComposer] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);

  const feedback = (rawFeedback ?? null) as CoachFeedback;

  const startSession = useCallback(async () => {
    if (status === "connecting" || status === "running") {
      return;
    }

    try {
      const beyRequest = fetch("/api/bey/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona: "ib_avatar_fr", locale: "fr-FR" })
      });

      const coachResultPromise = startCoachSession();

      const [coachResult, beyResult] = await Promise.allSettled([coachResultPromise, beyRequest]);

      if (coachResult.status !== "fulfilled" || !coachResult.value.ok) {
        throw new Error(coachResult.status === "fulfilled" ? coachResult.value.error : undefined);
      }

      if (beyResult.status === "fulfilled" && beyResult.value.ok) {
        const payload = await beyResult.value.json().catch(() => ({}));
        setBeyondPresenceSession(payload?.sessionId ?? null);
      } else {
        setBeyondPresenceSession(null);
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      }
    }
  }, [startCoachSession, status]);

  const finalizeSession = useCallback(async () => {
    const result = await finalizeCoachSession("manual");
    if (result.ok) {
      setBeyondPresenceSession(null);
    }
  }, [finalizeCoachSession]);

  const sendUserMessage = useCallback(async () => {
    if (!composer.trim()) {
      return;
    }
    const result = await sendText(composer);
    if (result.ok) {
      setComposer("");
    }
  }, [composer, sendText]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="flex flex-col gap-4">
        <div className="bento-card relative aspect-video overflow-hidden p-0">
          <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
          {!beyondPresenceSession ? (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 text-sm text-slate-300">
              Avatar Beyond Presence en cours de connexion...
            </div>
          ) : null}
        </div>
        <div className="bento-card flex items-center justify-between p-4">
          <div className="flex items-center gap-4 text-sm text-slate-200">
            <span
              className={`inline-flex h-3 w-3 rounded-full ${
                status === "running" ? "animate-pulse bg-emerald-400" : "bg-slate-500"
              }`}
            />
            <span>Statut : {status}</span>
            <span>Chrono : {elapsed}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={handleMicCheck}>
              Tester micro
            </Button>
            {status === "running" ? (
              <Button variant="outline" onClick={finalizeSession}>
                Terminer et générer feedback
              </Button>
            ) : (
              <Button onClick={startSession} disabled={status === "connecting"}>
                {status === "connecting" ? "Connexion..." : "Démarrer la session"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <TranscriptPanel transcript={transcript} />
        <ComposerPanel
          value={composer}
          disabled={status !== "running"}
          onChange={setComposer}
          onSend={sendUserMessage}
        />
        <NotesPanel />
        {feedback ? <FeedbackPanel feedback={feedback} /> : null}
      </div>
    </div>
  );
}

function TranscriptPanel({ transcript }: { transcript: TranscriptEntry[] }) {
  return (
    <div className="bento-card p-4">
      <h3 className="text-sm font-semibold text-slate-100">Transcript live</h3>
      <div className="mt-3 flex max-h-80 flex-col gap-3 overflow-y-auto text-sm text-slate-200">
        {transcript.map((entry, index) => (
          <div key={`${entry.timestamp}-${index}`} className="rounded-lg bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
              {entry.speaker === "candidate" ? "Vous" : "Coach"}
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
  );
}

function ComposerPanel({
  value,
  disabled,
  onChange,
  onSend
}: {
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="bento-card p-4">
      <h3 className="text-sm font-semibold text-slate-100">Envoyer une consigne</h3>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="h-28 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        placeholder={
          disabled
            ? "Démarrez une session pour envoyer des messages."
            : "Saisissez une question ou une précision à envoyer au coach."
        }
      />
      <div className="mt-3 flex justify-end">
        <Button onClick={onSend} disabled={disabled || !value.trim()}>
          Envoyer
        </Button>
      </div>
    </div>
  );
}

function NotesPanel() {
  return (
    <div className="bento-card p-4">
      <h3 className="text-sm font-semibold text-slate-100">Notes personnelles</h3>
      <textarea
        className="h-40 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none"
        placeholder="Prenez vos notes, timestamp automatique."
      />
    </div>
  );
}

function FeedbackPanel({ feedback }: { feedback: CoachFeedback }) {
  if (!feedback) return null;

  return (
    <div className="bento-card p-4">
      <h3 className="text-sm font-semibold text-slate-100">Feedback généré</h3>
      <div className="mt-3 space-y-3 text-sm text-slate-200">
        {feedback.summary ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Résumé</p>
            <p className="mt-1 text-sm text-slate-100">{feedback.summary}</p>
          </div>
        ) : null}
        {feedback.strengths?.length ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Forces</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {feedback.strengths.map((item, index) => (
                <li key={`strength-${index}`} className="text-sm text-slate-100">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {feedback.improvements?.length ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
              Axes d'amélioration
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {feedback.improvements.map((item, index) => (
                <li key={`improvement-${index}`} className="text-sm text-slate-100">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {feedback.recommendations?.length ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
              Recommandations
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {feedback.recommendations.map((item, index) => (
                <li key={`recommendation-${index}`} className="text-sm text-slate-100">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {feedback.raw ? (
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">Sortie brute</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-100">{feedback.raw}</p>
          </div>
        ) : null}
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
