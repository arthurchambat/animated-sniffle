"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";
import { LiveKitRoom, RoomAudioRenderer, useLocalParticipant } from "@livekit/components-react";
import { InterviewPlayer } from "@/components/interview/InterviewPlayer";
import { LiveControls } from "@/components/interview/LiveControls";
import { LiveSidebar } from "@/components/interview/LiveSidebar";
import { BentoCard } from "@/components/ui/bento-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { InterviewSession } from "@/lib/types/interview";

interface LiveInterviewClientProps {
  session: InterviewSession;
  userName: string;
}

// Questions mock pour la démo
const MOCK_QUESTIONS = [
  {
    id: "1",
    text: "Pouvez-vous vous présenter brièvement et nous parler de votre parcours ?",
    asked: false,
  },
  {
    id: "2",
    text: "Pourquoi souhaitez-vous rejoindre notre entreprise ?",
    asked: false,
  },
  {
    id: "3",
    text: "Parlez-moi d'une situation où vous avez dû gérer un conflit en équipe.",
    asked: false,
  },
  {
    id: "4",
    text: "Quelles sont vos plus grandes forces et faiblesses ?",
    asked: false,
  },
  {
    id: "5",
    text: "Où vous voyez-vous dans 5 ans ?",
    asked: false,
  },
];

export function LiveInterviewClient({ session, userName }: LiveInterviewClientProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  
  const [timeRemaining, setTimeRemaining] = useState(session.duration_minutes * 60); // en secondes
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [isEnding, setIsEnding] = useState(false);
  const [token, setToken] = useState("");
  const [beySessionId, setBeySessionId] = useState<string | null>(null);
  const completionRef = useRef(false);

  // Initialize LiveKit and BeyondPresence session
  useEffect(() => {
    (async () => {
      try {
        // Get LiveKit token
        const tokenResp = await fetch(
          `/api/livekit/token?room=${session.id}&username=${encodeURIComponent(userName)}`
        );
        
        if (!tokenResp.ok) {
          const errorData = await tokenResp.json();
          throw new Error(errorData.error || "Failed to get LiveKit token");
        }
        
        const tokenData = await tokenResp.json();
        
        if (!tokenData.token) {
          throw new Error("No token received from server");
        }
        
        setToken(tokenData.token);
        console.log("✅ LiveKit token received");

        // Initialize BeyondPresence avatar session
        const beyResp = await fetch("/api/bey/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: session.id,
            persona: `You are conducting a ${session.position_round} interview for a ${session.role} position at ${session.company}. Focus on ${session.focus_areas?.join(", ") || "finance topics"}. Be professional, wait for the candidate to finish speaking, and ask thoughtful follow-up questions.`,
          }),
        });
        
        if (beyResp.ok) {
          const beyData = await beyResp.json();
          setBeySessionId(beyData.sessionId);
          console.log("✅ BeyondPresence avatar session created:", beyData.sessionId);
        } else {
          console.warn("⚠️ BeyondPresence avatar session failed (avatar will not appear)");
        }
      } catch (e) {
        console.error("❌ Error initializing session:", e);
        toast.error("Failed to initialize interview session. Please refresh the page.");
      }
    })();
  }, [session.id, userName, session.position_round, session.role, session.company, session.focus_areas]);

  const completeInterview = useCallback(
    async (origin: "manual" | "auto") => {
      if (completionRef.current) {
        return;
      }
      completionRef.current = true;

      try {
        const { error: updateError } = await supabase
          .from("interview_sessions")
          .update({
            status: "completed",
            ended_at: new Date().toISOString()
          })
          .eq("id", session.id);

        if (updateError) throw updateError;

        // Mock feedback generation
        const generalSummary = "Bonne performance globale. Vous avez montré de bonnes compétences en communication et une compréhension claire du poste.";
        const strengths = [
          "Excellente présentation personnelle",
          "Réponses structurées et claires",
          "Bonne connaissance de l'entreprise"
        ];
        const improvements = [
          "Développer davantage les exemples concrets",
          "Travailler la confiance en soi",
          "Préparer des questions plus approfondies"
        ];

        const { error: feedbackError } = await supabase
          .from("interview_feedback")
          .insert({
            session_id: session.id,
            general: generalSummary,
            went_well: strengths,
            to_improve: improvements,
            per_question: questions
              .filter((q) => q.asked)
              .map((q) => ({
                question: q.text,
                summary: "Réponse complète et pertinente.",
                tips: ["Ajouter plus de détails quantifiés", "Utiliser la méthode STAR"],
                score: 70 + Math.random() * 20
              })),
            score_overall: null // Le score sera calculé après l'analyse IA
          });

        if (feedbackError) throw feedbackError;

        toast.success(
          origin === "manual"
            ? "Interview terminée ! Redirection vers l'analyse..."
            : "Session terminée automatiquement. Redirection..."
        );
        router.push(`/interview/feedback/${session.id}`);
      } catch (error) {
        console.error("Error ending interview:", error);
        toast.error("Erreur lors de la fin de l'interview");
        completionRef.current = false;
        setIsEnding(false);
      }
    },
    [questions, router, session.id, supabase, setIsEnding]
  );

  const handleEndInterview = useCallback(async () => {
    if (isEnding || completionRef.current) {
      return;
    }
    setIsEnding(true);
    await completeInterview("manual");
  }, [completeInterview, isEnding]);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [handleEndInterview]);

  // Simuler la progression des questions
  useEffect(() => {
    const questionInterval = setInterval(() => {
      setQuestions((prevQuestions) => {
        const updated = [...prevQuestions];
        if (currentQuestionIndex < updated.length && updated[currentQuestionIndex]) {
          updated[currentQuestionIndex] = { 
            id: updated[currentQuestionIndex].id,
            text: updated[currentQuestionIndex].text,
            asked: true 
          };
        }
        return updated;
      });

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    }, 30000); // Nouvelle question toutes les 30 secondes (pour la démo)

    return () => clearInterval(questionInterval);
  }, [currentQuestionIndex, questions.length]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = (timeRemaining / (session.duration_minutes * 60)) * 100;
  const isLowTime = timeRemaining < 300; // Moins de 5 minutes

  if (token === "") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center space-y-4">
          <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400">Initializing interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: '100%' }}
      connect={true}
      onConnected={() => {
        console.log("✅ Connected to LiveKit room");
      }}
      onDisconnected={() => {
        console.log("❌ Disconnected from LiveKit room");
      }}
      onError={(error) => {
        console.error("❌ LiveKit error:", error);
        toast.error("Failed to connect to interview room");
      }}
    >
      <div className="space-y-6">
        {/* Header avec timer */}
        <BentoCard padding="md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-100">{session.title}</h1>
              <p className="text-sm text-slate-400">
                {session.company} · {session.role}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Clock className={`h-5 w-5 ${isLowTime ? 'text-rose-400' : 'text-emerald-400'}`} />
                <div className="text-right">
                  <p className={`text-2xl font-bold tabular-nums ${isLowTime ? 'text-rose-400' : 'text-slate-100'}`}>
                    {formatTime(timeRemaining)}
                  </p>
                  <p className="text-xs text-slate-400">restant</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isLowTime ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${timePercentage}%` }}
                />
              </div>
            </div>
          </div>

          {isLowTime && (
            <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-rose-500/10 border border-rose-400/30">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <p className="text-xs text-rose-300">
                Temps bientôt écoulé ! Préparez votre conclusion.
              </p>
            </div>
          )}
        </BentoCard>

        {/* Main content: Video + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Video player */}
          <div className="space-y-4">
            <InterviewPlayer userName={userName} />
            
            {/* Controls */}
            <div className="flex justify-center">
              <LiveControlsWrapper onEndInterview={handleEndInterview} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] overflow-y-auto">
            <LiveSidebar
              questions={questions}
              currentQuestionIndex={currentQuestionIndex}
            />
          </div>
        </div>
      </div>
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}

function LiveControlsWrapper({ onEndInterview }: { onEndInterview: () => void }) {
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = async (muted: boolean) => {
    if (localParticipant) {
      await localParticipant.setMicrophoneEnabled(!muted);
      setIsMuted(muted);
    }
  };

  const toggleVideo = async (videoOff: boolean) => {
    if (localParticipant) {
      await localParticipant.setCameraEnabled(!videoOff);
      setIsVideoOff(videoOff);
    }
  };

  return (
    <LiveControls
      onEndInterview={onEndInterview}
      onHelpRequest={() => toast.info("L'aide arrive bientôt !")}
      isMuted={isMuted}
      isVideoOff={isVideoOff}
      onToggleMute={toggleMute}
      onToggleVideo={toggleVideo}
    />
  );
}
