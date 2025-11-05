"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";
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

  // Refs pour les timers
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fonction pour arrêter tous les timers
  const stopAllTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (questionIntervalRef.current) {
      clearInterval(questionIntervalRef.current);
      questionIntervalRef.current = null;
    }
  }, []);

  // Timer principal
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          stopAllTimers();
          handleEndInterview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [stopAllTimers]);

  // Simuler la progression des questions
  useEffect(() => {
    questionIntervalRef.current = setInterval(() => {
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

    return () => {
      if (questionIntervalRef.current) {
        clearInterval(questionIntervalRef.current);
      }
    };
  }, [currentQuestionIndex, questions.length]);

  const handleEndInterview = useCallback(async () => {
    if (isEnding) return;
    
    // Arrêter tous les timers immédiatement
    stopAllTimers();
    setIsEnding(true);

    try {
      // Import dynamique de l'action serveur
      const { completeInterviewSession } = await import("@/lib/actions/interview");

      // Préparer le payload de feedback
      const payload = {
        general: "Bonne performance globale. Vous avez montré de bonnes compétences en communication et une compréhension claire du poste.",
        went_well: [
          "Excellente présentation personnelle",
          "Réponses structurées et claires",
          "Bonne connaissance de l'entreprise",
        ],
        to_improve: [
          "Développer davantage les exemples concrets",
          "Travailler la confiance en soi",
          "Préparer des questions plus approfondies",
        ],
        per_question: questions.filter(q => q.asked).map((q) => ({
          question: q.text,
          summary: "Réponse complète et pertinente.",
          tips: ["Ajouter plus de détails quantifiés", "Utiliser la méthode STAR"],
          score: 70 + Math.random() * 20, // Score aléatoire entre 70-90
        })),
        score_overall: 78,
      };

      // Appel à l'action serveur
      const result = await completeInterviewSession(session.id, payload);

      if (!result.success) {
        throw new Error(result.error || "Erreur lors de la complétion de l'interview");
      }

      toast.success("Interview terminée ! Redirection vers l'analyse...");
      router.push(`/interview/feedback/${session.id}`);
    } catch (error: any) {
      console.error('[LiveInterviewClient] Error ending interview:', error);
      toast.error(error.message || "Erreur lors de la fin de l'interview");
      setIsEnding(false);
    }
  }, [isEnding, session.id, questions, router, stopAllTimers]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const timePercentage = (timeRemaining / (session.duration_minutes * 60)) * 100;
  const isLowTime = timeRemaining < 300; // Moins de 5 minutes

  return (
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
            <LiveControls
              onEndInterview={handleEndInterview}
              onHelpRequest={() => toast.info("L'aide arrive bientôt !")}
            />
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
  );
}
