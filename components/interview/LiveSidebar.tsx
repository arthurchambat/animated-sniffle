"use client";

import { BentoCard } from "@/components/ui/bento-card";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Question {
  id: string;
  text: string;
  asked: boolean;
}

interface LiveSidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
}

export function LiveSidebar({ questions, currentQuestionIndex }: LiveSidebarProps) {
  return (
    <div className="space-y-4">
      <BentoCard padding="md" className="bg-slate-900/50">
        <h3 className="font-semibold text-slate-100 mb-4">Interview Progress</h3>
        <div className="space-y-4">
          {questions.map((question, index) => {
            const isCurrent = index === currentQuestionIndex;
            const isPast = index < currentQuestionIndex;
            
            return (
              <div 
                key={question.id}
                className={`relative pl-6 pb-6 border-l ${
                  isPast ? 'border-emerald-500/50' : 
                  isCurrent ? 'border-indigo-500/50' : 
                  'border-slate-700'
                } last:pb-0`}
              >
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-slate-950 ${
                  isPast ? 'border-emerald-500 text-emerald-500' :
                  isCurrent ? 'border-indigo-500 text-indigo-500' :
                  'border-slate-700 text-slate-700'
                }`}>
                  {isPast ? <CheckCircle2 className="h-3 w-3" /> : 
                   isCurrent ? <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" /> :
                   <Circle className="h-3 w-3" />}
                </div>

                <div className={`transition-all ${isCurrent ? 'opacity-100' : 'opacity-60'}`}>
                  <p className="text-xs font-medium text-slate-400 mb-1">
                    Question {index + 1}
                  </p>
                  <p className="text-sm text-slate-200 line-clamp-2">
                    {question.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </BentoCard>

      <BentoCard padding="md" className="bg-indigo-500/10 border-indigo-500/20">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-indigo-300">Pro Tip</h4>
            <p className="text-xs text-indigo-200/70 mt-1">
              Take a moment to structure your answer before speaking. The AI appreciates clear, logical reasoning.
            </p>
          </div>
        </div>
      </BentoCard>
    </div>
  );
}
