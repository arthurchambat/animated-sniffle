import Link from "next/link";
import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { ProgressionChart } from "@/components/charts/progression-chart";

const kpis = [
  { label: "Nombre d'interviews", value: "12", delta: "+3 ce mois" },
  { label: "Score moyen", value: "78/100", delta: "+6 vs. dernier mois" },
  { label: "Temps de réponse", value: "3.2s", delta: "-0.8s" },
  { label: "Feedbacks générés", value: "12", delta: "100% couverts" }
];

const feedbackLinks = [
  { id: "session-12", label: "Interview n°12 — Sales & Trading", href: "/feedback/general" },
  { id: "session-11", label: "Interview n°11 — Structuration", href: "/feedback/questions" }
];

export default function DashboardPage() {
  return (
    <Section
      eyebrow="Mon tableau de bord"
      title="Suivi de progression"
      subtitle="Visualisez vos KPIs, vos feedbacks récents et vos axes de progression."
      className="gap-8"
    >
      <div className="grid gap-4 md:grid-cols-4">
        {kpis.map((kpi) => (
          <BentoCard key={kpi.label} padding="lg" className="flex flex-col gap-2">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/70">{kpi.label}</p>
            <p className="text-2xl font-semibold text-slate-50">{kpi.value}</p>
            <p className="text-xs text-slate-400">{kpi.delta}</p>
          </BentoCard>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
        <BentoCard padding="lg">
          <h3 className="text-sm font-semibold text-slate-100">Progression par axe</h3>
          <ProgressionChart />
        </BentoCard>
        <BentoCard padding="lg">
          <h3 className="text-sm font-semibold text-slate-100">Feedbacks récents</h3>
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
        </BentoCard>
      </div>
      <BentoCard padding="lg" className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-100">Les avis</h3>
        <p className="text-sm text-slate-300/80">
          “Les drill-down sont ultra précis, j&apos;ai décroché mon offre PE.” — Antoine, Associate.
        </p>
        <p className="text-sm text-slate-300/80">
          “J&apos;adore les heatmaps : en 4 sessions, mon score stress management est passé de 52 à 86.” — Inès,
          Analyst S&T.
        </p>
      </BentoCard>
    </Section>
  );
}
