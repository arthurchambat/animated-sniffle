import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { FileText, Calendar, TrendingUp, Download, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { DeleteFeedbackButton } from "@/components/interview/DeleteFeedbackButton";
import type { InterviewSession, InterviewFeedback } from "@/lib/types/interview";

interface SessionWithFeedback extends InterviewSession {
  feedback: InterviewFeedback | null;
}

async function getFeedbacks(): Promise<SessionWithFeedback[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
      set(name, value, options) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {}
      },
      remove(name, options) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {}
      },
    },
  });

  // Récupérer les sessions complétées avec leurs feedbacks
  const { data, error } = await supabase
    .from("interview_sessions")
    .select(`
      *,
      feedback:interview_feedback(*)
    `)
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[FeedbacksPage] Error fetching feedbacks:", error);
    return [];
  }

  // Transformer les données pour inclure le premier feedback
  return (data || []).map((session: any) => ({
    ...session,
    feedback: session.feedback?.[0] || null,
  }));
}

export default async function FeedbacksPage() {
  const feedbacks = await getFeedbacks();
  const hasData = feedbacks.length > 0;

  // Calculer les stats
  const totalSessions = feedbacks.length;
  const averageScore = hasData
    ? Math.round(
        feedbacks.reduce((acc, f) => acc + (f.feedback?.score_overall || 0), 0) / totalSessions
      )
    : 0;

  // Calculer la progression (comparer les 2 dernières sessions)
  let progression = 0;
  if (feedbacks.length >= 2) {
    const lastScore = feedbacks[0]?.feedback?.score_overall || 0;
    const previousScore = feedbacks[1]?.feedback?.score_overall || 0;
    if (previousScore > 0) {
      progression = Math.round(((lastScore - previousScore) / previousScore) * 100);
    }
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes feedbacks"
        subtitle="Consultez tous vos rapports d'entretien et suivez votre progression."
      />

      {hasData ? (
        <div className="space-y-4">
          {/* Stats overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <BentoCard padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-white/70">Total sessions</p>
              <p className="text-2xl font-semibold text-white">{totalSessions}</p>
            </BentoCard>
            
            <BentoCard padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-white/70">Score moyen</p>
              <p className="text-2xl font-semibold text-white">
                {averageScore}%
              </p>
            </BentoCard>
            
            <BentoCard padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-wider text-white/70">Progression</p>
              <p className={`text-2xl font-semibold flex items-center gap-2 ${progression >= 0 ? 'text-white' : 'text-rose-400'}`}>
                <TrendingUp className="h-5 w-5" />
                {progression >= 0 ? '+' : ''}{progression}%
              </p>
            </BentoCard>
          </div>

          {/* Feedbacks list */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Historique des sessions</h2>
            {feedbacks.map((session) => (
              <BentoCard key={session.id} padding="lg" className="hover:border-white/30 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-white">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.created_at).toLocaleDateString('fr-FR', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span>Durée: {session.duration_minutes} min</span>
                        <span className="text-white/50">{session.company}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {session.feedback?.score_overall !== null && session.feedback?.score_overall !== undefined && (
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-white">{Math.round(session.feedback.score_overall)}%</p>
                        <p className="text-xs text-white/60">Score global</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="secondary">
                        <Link href={`/interview/feedback/${session.id}`}>
                          Voir le rapport
                        </Link>
                      </Button>
                      <DeleteFeedbackButton sessionId={session.id} />
                    </div>
                  </div>
                </div>
              </BentoCard>
            ))}
          </div>
        </div>
      ) : (
        <BentoCard padding="lg">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-16 w-16 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Aucun feedback pour le moment
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-md">
              Passez votre première interview pour recevoir un rapport détaillé avec analyse de vos performances.
            </p>
            <Button asChild size="lg">
              <Link href="/interview/new">
                Lancer ma première interview
              </Link>
            </Button>
          </div>
        </BentoCard>
      )}
    </div>
  );
}
