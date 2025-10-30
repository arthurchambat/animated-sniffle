import Link from "next/link";
import { ArrowRight, Video, FileText, BarChart3 } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { ProgressionChart } from "@/components/charts/progression-chart";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/PageHeader";
import { getCurrentUser } from "@/lib/auth/get-current-user";

const kpis = [
  { label: "Nombre d'interviews", value: "0", delta: "Commencez votre première" },
  { label: "Score moyen", value: "—", delta: "Pas encore de données" },
  { label: "Temps de réponse", value: "—", delta: "Pas encore de données" },
  { label: "Feedbacks générés", value: "0", delta: "Lancez une session" }
];

const feedbackLinks = [
  { id: "empty-state", label: "Aucun feedback disponible", href: "#" }
];

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const firstName = user?.firstName || "là";
  const hasData = false; // TODO: Check if user has any sessions/feedbacks

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Salut ${firstName} 👋`}
        subtitle="Bienvenue sur ton espace personnel. Lance une nouvelle session ou consulte tes feedbacks."
      />
      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <BentoCard padding="lg" className="group relative overflow-hidden hover:border-emerald-400/40 transition-all">
          <Link href="/interview/new" className="flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200 transition-transform group-hover:scale-110">
              <Video className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-100">Démarrer une interview</h3>
              <p className="text-sm text-slate-400">Lance une nouvelle simulation vidéo avec l'IA</p>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-200 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </BentoCard>

        <BentoCard padding="lg" className="group relative overflow-hidden hover:border-emerald-400/40 transition-all">
          <Link href="/feedback/general" className="flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200 transition-transform group-hover:scale-110">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-100">Voir mes feedbacks</h3>
              <p className="text-sm text-slate-400">Consulte tes rapports et analyses détaillées</p>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-200 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </BentoCard>

        <BentoCard padding="lg" className="group relative overflow-hidden hover:border-emerald-400/40 transition-all">
          <Link href="/dashboard" className="flex flex-col gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-200 transition-transform group-hover:scale-110">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-100">Ma progression</h3>
              <p className="text-sm text-slate-400">Suis ton évolution et tes statistiques</p>
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-200 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </BentoCard>
      </div>

      {/* KPIs */}
      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-100">Tes statistiques</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {kpis.map((kpi) => (
            <BentoCard key={kpi.label} padding="lg" className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">{kpi.label}</p>
              <p className="text-2xl font-semibold text-slate-50">{kpi.value}</p>
              <p className="text-xs text-slate-400">{kpi.delta}</p>
            </BentoCard>
          ))}
        </div>
      </div>

      {/* Charts and Recent Feedbacks */}
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <BentoCard padding="lg">
          <h3 className="mb-4 text-sm font-semibold text-slate-100">Progression par axe</h3>
          {hasData ? (
            <ProgressionChart />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BarChart3 className="mb-4 h-12 w-12 text-slate-600" />
              <p className="text-sm text-slate-400">Aucune donnée pour le moment</p>
              <p className="mt-2 text-xs text-slate-500">Lance ta première interview pour voir ta progression</p>
              <Button asChild className="mt-6" size="sm">
                <Link href="/interview/new">Commencer maintenant</Link>
              </Button>
            </div>
          )}
        </BentoCard>

        <BentoCard padding="lg">
          <h3 className="mb-4 text-sm font-semibold text-slate-100">Feedbacks récents</h3>
          {hasData ? (
            <ul className="mt-3 space-y-3 text-sm text-slate-200">
              {feedbackLinks.map((item) => (
                <li key={item.id} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <Link href={item.href} className="text-emerald-200 hover:text-emerald-100">
                    Voir
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="mb-3 h-10 w-10 text-slate-600" />
              <p className="text-sm text-slate-400">Aucun feedback disponible</p>
              <p className="mt-2 text-xs text-slate-500">Passe ta première interview pour recevoir ton rapport détaillé</p>
            </div>
          )}
        </BentoCard>
      </div>

      {/* Welcome Message */}
      {!hasData && (
        <BentoCard padding="lg" className="border-emerald-400/20 bg-linear-to-br from-emerald-500/10 to-transparent">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-100">🚀 Prêt à commencer ?</h3>
            <p className="text-sm text-slate-300/90">
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
          <h3 className="text-sm font-semibold text-slate-100">Les avis</h3>
          <p className="text-sm text-slate-300/80">
            "Les drill-down sont ultra précis, j&apos;ai décroché mon offre PE." — Antoine, Associate.
          </p>
          <p className="text-sm text-slate-300/80">
            "J&apos;adore les heatmaps : en 4 sessions, mon score stress management est passé de 52 à 86." — Inès,
            Analyst S&T.
          </p>
        </BentoCard>
      )}
    </div>
  );
}
