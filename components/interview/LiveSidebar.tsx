"use client";

import { useState } from "react";
import { CheckCircle2, Circle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/cn";
import { BentoCard } from "@/components/ui/bento-card";

interface Question {
  id: string;
  text: string;
  asked: boolean;
  timestamp?: string;
}

interface LiveSidebarProps {
  questions: Question[];
  currentQuestionIndex: number;
}

export function LiveSidebar({ questions, currentQuestionIndex }: LiveSidebarProps) {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<string[]>([]);

  const handleAddNote = () => {
    if (note.trim()) {
      setNotes([...notes, note]);
      setNote("");
    }
  };

  return (
    <div className="space-y-4">
      {/* Questions */}
      <BentoCard padding="md">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <MessageSquare className="h-4 w-4 text-emerald-200" />
            <h3 className="text-sm font-semibold text-slate-100">Questions</h3>
          </div>
          
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className={cn(
                  "flex items-start gap-2 p-2 rounded-lg transition-all text-xs",
                  idx === currentQuestionIndex && "bg-emerald-500/10 border border-emerald-400/30",
                  q.asked && idx !== currentQuestionIndex && "opacity-50"
                )}
              >
                {q.asked ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <Circle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                )}
                <p className={cn(
                  "text-slate-300 leading-relaxed",
                  idx === currentQuestionIndex && "font-medium text-emerald-100"
                )}>
                  {q.text}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-slate-400">
            {currentQuestionIndex + 1} / {questions.length} questions
          </div>
        </div>
      </BentoCard>

      {/* Notes rapides */}
      <BentoCard padding="md">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-100">Notes rapides</h3>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              placeholder="Ajouter une note..."
              className="flex-1 rounded-(--radius) border border-white/15 bg-slate-950/40 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
            <button
              type="button"
              onClick={handleAddNote}
              className="px-3 py-2 rounded-(--radius) bg-emerald-500/20 text-emerald-200 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
            >
              +
            </button>
          </div>

          {notes.length > 0 && (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {notes.map((n, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-800/50 border border-white/10 text-xs text-slate-300"
                >
                  {n}
                </div>
              ))}
            </div>
          )}
        </div>
      </BentoCard>

      {/* Progression */}
      <BentoCard padding="md">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-slate-100">Progression</h3>
          <div className="w-full bg-slate-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 text-center">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% complété
          </p>
        </div>
      </BentoCard>
    </div>
  );
}
