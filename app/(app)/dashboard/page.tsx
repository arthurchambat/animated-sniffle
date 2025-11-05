import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { ArrowRight, Video, FileText, BarChart3 } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { ProgressionChart } from "@/components/charts/progression-chart";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { InterviewRecentStats } from "@/lib/types/interview";

async function getInterviewStats(userId: string): Promise<InterviewRecentStats | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
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

  const { data, error } = await supabase
    .from("interview_recent_stats")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("[Dashboard] Error fetching stats:", error);
    return null;
  }

  return data as InterviewRecentStats;
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const firstName = user?.firstName || "là";
  const stats = await getInterviewStats(user.id);
  const hasData = stats && stats.total_sessions > 0;

  // Construire les KPIs à partir des stats réelles
  const kpis = [
    { 
      label: "Nombre d'interviews", 
      value: stats?.total_sessions?.toString() || "0", 
      delta: stats?.total_sessions ? `${stats.total_sessions} session${stats.total_sessions > 1 ? 's' : ''}` : "Commencez votre première" 
    },
    { 
      label: "Score moyen", 
      value: stats?.average_score ? `${Math.round(stats.average_score)}%` : "—", 
      delta: stats?.average_score ? "Score global" : "Pas encore de données" 
    },
    { 
      label: "Dernière session", 
      value: stats?.last_completed_session 
        ? new Date(stats.last_completed_session).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
        : "—", 
      delta: stats?.last_completed_session ? "Date de completion" : "Pas encore de données" 
    },
    { 
      label: "Feedbacks générés", 
      value: stats?.total_feedbacks?.toString() || "0", 
      delta: stats?.total_feedbacks ? `${stats.total_feedbacks} rapport${stats.total_feedbacks > 1 ? 's' : ''}` : "Lancez une session" 
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Salut ${firstName} 👋`}
        subtitle="Bienvenue sur ton espace personnel. Lance une nouvelle session ou consulte tes feedbacks."
      />
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <BentoCard padding="lg" className="group relative overflow-hidden hover:border-white/30 transition-all">
          <Link href="/interview/new" className="flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform group-hover:scale-110">
              <Video className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Démarrer une interview</h3>
              <p className="text-sm text-white/60">Lance une nouvelle simulation vidéo avec l'IA</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </BentoCard>

        <BentoCard padding="lg" className="group relative overflow-hidden hover:border-white/30 transition-all">
          <Link href="/feedback/general" className="flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform group-hover:scale-110">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Voir mes feedbacks</h3>
              <p className="text-sm text-white/60">Consulte tes rapports et analyses détaillées</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </BentoCard>

        <BentoCard padding="lg" className="group relative overflow-hidden hover:border-white/30 transition-all">
          <Link href="/dashboard" className="flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white transition-transform group-hover:scale-110">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Ma progression</h3>
              <p className="text-sm text-white/60">Suis ton évolution et tes statistiques</p>
            </div>
            <ArrowRight className="h-4 w-4 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </BentoCard>
      </div>

      {/* KPIs */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-white">Tes statistiques</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {kpis.map((kpi) => (
            <BentoCard key={kpi.label} padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.25em] text-white/70">{kpi.label}</p>
              <p className="text-2xl font-semibold text-white">{kpi.value}</p>
              <p className="text-xs text-white/60">{kpi.delta}</p>
            </BentoCard>
          ))}
        </div>
      </div>

      {/* Charts and Recent Feedbacks */}
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <BentoCard padding="lg">
          <h3 className="mb-4 text-sm font-semibold text-white">Progression par axe</h3>
          {hasData ? (
            <ProgressionChart />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="mb-4 h-12 w-12 text-white/20" />
              <p className="text-sm text-white/60">Aucune donnée pour le moment</p>
              <p className="mt-2 text-xs text-white/50">Lance ta première interview pour voir ta progression</p>
              <Button asChild className="mt-6" size="sm">
                <Link href="/interview/new">Commencer maintenant</Link>
              </Button>
            </div>
          )}
        </BentoCard>

        <BentoCard padding="lg">
          <h3 className="mb-4 text-sm font-semibold text-white">Feedbacks récents</h3>
          {hasData ? (
            <div className="space-y-3">
              <p className="text-sm text-white/70">
                {stats?.last_feedback_date && (
                  <>
                    Dernier feedback le{" "}
                    {new Date(stats.last_feedback_date).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </>
                )}
              </p>
              <Button asChild size="sm" className="w-full">
                <Link href="/feedbacks">
                  Voir tous mes feedbacks
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-3 h-10 w-10 text-white/20" />
              <p className="text-sm text-white/60">Aucun feedback disponible</p>
              <p className="mt-2 text-xs text-white/50">Passe ta première interview pour recevoir ton rapport détaillé</p>
            </div>
          )}
        </BentoCard>
      </div>

      {/* Welcome Message */}
      {!hasData && (
        <BentoCard padding="lg" className="border-white/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">🚀 Prêt à commencer ?</h3>
            <p className="text-sm text-white/70">
              Bienvenue sur FinanceBro ! Tu es à quelques minutes de ta première simulation d'entretien.
              Choisis ton secteur, ton rôle et ton niveau pour recevoir des questions adaptées à ton profil.
            </p>
            <Button asChild size="lg" className="mt-4">
              <Link href="/interview/new">
                Lancer ma première interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </BentoCard>
      )}

      {/* Testimonials - only show if user has some experience */}
      {hasData && (
        <BentoCard padding="lg" className="space-y-3">
          <h3 className="text-sm font-semibold text-white">Les avis</h3>
          <p className="text-sm text-white/70">
            "Les drill-down sont ultra précis, j&apos;ai décroché mon offre PE." — Antoine, Associate.
          </p>
          <p className="text-sm text-white/70">
            "J&apos;adore les heatmaps : en 4 sessions, mon score stress management est passé de 52 à 86." — Inès,
            Analyst S&T.
          </p>
        </BentoCard>
      )}
    </div>
  );
}
