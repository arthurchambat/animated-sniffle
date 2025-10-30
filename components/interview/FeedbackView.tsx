"use client";

import { Download, Home, TrendingUp, TrendingDown, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/bento-card";
import type { InterviewFeedback, QuestionFeedback } from "@/lib/types/interview";
import { cn } from "@/lib/cn";

interface FeedbackViewProps {
  feedback: InterviewFeedback;
  sessionTitle: string;
  company: string;
  role: string;
  date: string;
}

export function FeedbackView({ feedback, sessionTitle, company, role, date }: FeedbackViewProps) {
  const handleExportPDF = () => {
    // Pour l'instant, on ouvre simplement une fenêtre d'impression
    // Dans une version complète, utiliser @react-pdf/renderer ou html2pdf.js
    window.print();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-rose-400";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Bien";
    return "À améliorer";
  };

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header actions - masqué à l'impression */}
      <div className="flex items-center justify-between print:hidden">
        <Button asChild variant="ghost">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Retour au dashboard
          </Link>
        </Button>

        <Button onClick={handleExportPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Télécharger le rapport PDF
        </Button>
      </div>

      {/* Titre et infos - visible à l'impression */}
      <div className="print:mb-4">
        <h1 className="text-3xl font-bold text-slate-100 print:text-black">{sessionTitle}</h1>
        <p className="text-sm text-slate-400 mt-1 print:text-gray-600">
          {company} · {role} · {new Date(date).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {/* Score global */}
      {feedback.score_overall !== null && (
        <BentoCard padding="lg" className="print:border print:border-gray-300">
          <div className="text-center">
            <p className="text-sm text-slate-400 mb-2 print:text-gray-600">Score global</p>
            <div className="flex items-center justify-center gap-3">
              <span className={cn(
                "text-6xl font-bold tabular-nums",
                getScoreColor(feedback.score_overall),
                "print:text-black"
              )}>
                {Math.round(feedback.score_overall)}
              </span>
              <span className="text-2xl text-slate-500 print:text-gray-500">/100</span>
            </div>
            <p className={cn(
              "text-sm font-medium mt-2",
              getScoreColor(feedback.score_overall),
              "print:text-black"
            )}>
              {getScoreLabel(feedback.score_overall)}
            </p>
          </div>
        </BentoCard>
      )}

      {/* Feedback général */}
      {feedback.general && (
        <BentoCard padding="lg" className="print:border print:border-gray-300">
          <h2 className="text-xl font-semibold text-slate-100 mb-3 print:text-black">
            Feedback général
          </h2>
          <p className="text-slate-300 leading-relaxed print:text-gray-800">
            {feedback.general}
          </p>
        </BentoCard>
      )}

      {/* Points forts et axes d'amélioration */}
      <div className="grid md:grid-cols-2 gap-6 print:gap-4">
        {/* Ce qui a bien fonctionné */}
        {feedback.went_well && feedback.went_well.length > 0 && (
          <BentoCard padding="lg" className="print:border print:border-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-emerald-400 print:text-green-600" />
              <h2 className="text-lg font-semibold text-slate-100 print:text-black">
                Points forts
              </h2>
            </div>
            <ul className="space-y-2">
              {feedback.went_well.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 print:text-green-600" />
                  <span className="text-slate-300 print:text-gray-800">{point}</span>
                </li>
              ))}
            </ul>
          </BentoCard>
        )}

        {/* Axes d'amélioration */}
        {feedback.to_improve && feedback.to_improve.length > 0 && (
          <BentoCard padding="lg" className="print:border print:border-gray-300">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="h-5 w-5 text-yellow-400 print:text-orange-600" />
              <h2 className="text-lg font-semibold text-slate-100 print:text-black">
                Axes d'amélioration
              </h2>
            </div>
            <ul className="space-y-2">
              {feedback.to_improve.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-400 shrink-0 mt-0.5 print:text-orange-600" />
                  <span className="text-slate-300 print:text-gray-800">{point}</span>
                </li>
              ))}
            </ul>
          </BentoCard>
        )}
      </div>

      {/* Analyse par question */}
      {feedback.per_question && feedback.per_question.length > 0 && (
        <BentoCard padding="lg" className="print:border print:border-gray-300">
          <h2 className="text-xl font-semibold text-slate-100 mb-4 print:text-black">
            Analyse détaillée par question
          </h2>

          <div className="space-y-6 print:space-y-4">
            {feedback.per_question.map((qf: QuestionFeedback, idx) => (
              <div key={idx} className="border-l-2 border-emerald-400 pl-4 print:border-green-600">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-sm font-medium text-slate-100 flex-1 print:text-black">
                    Question {idx + 1}: {qf.question}
                  </h3>
                  <span className={cn(
                    "text-lg font-bold tabular-nums shrink-0",
                    getScoreColor(qf.score),
                    "print:text-black"
                  )}>
                    {Math.round(qf.score)}/100
                  </span>
                </div>

                <p className="text-sm text-slate-300 mb-3 print:text-gray-800">
                  {qf.summary}
                </p>

                {qf.tips && qf.tips.length > 0 && (
                  <div className="bg-slate-800/30 rounded-lg p-3 print:bg-gray-100">
                    <p className="text-xs font-medium text-emerald-200 mb-2 print:text-green-700">
                      💡 Conseils pour s'améliorer :
                    </p>
                    <ul className="space-y-1">
                      {qf.tips.map((tip, tipIdx) => (
                        <li key={tipIdx} className="text-xs text-slate-400 print:text-gray-700">
                          • {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </BentoCard>
      )}

      {/* Footer à l'impression */}
      <div className="hidden print:block text-center text-xs text-gray-500 mt-8 border-t border-gray-300 pt-4">
        <p>Rapport généré par FinanceBro · {new Date().toLocaleDateString('fr-FR')}</p>
        <p className="mt-1">www.financebro.app</p>
      </div>
    </div>
  );
}
