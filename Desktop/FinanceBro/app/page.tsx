import Link from "next/link";
import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { LandingActions } from "@/components/home/landing-actions";
import { ProgressionChart } from "@/components/charts/progression-chart";
import { loadFlowGraph } from "@/lib/flow";

export default async function HomePage() {
  const siteFlow = await loadFlowGraph("site");

  return (
    <div className="flex flex-col gap-12">
      <Section
        eyebrow="Mock interview finance augmentée"
        title="Votre avatar coach pour réussir chaque entretien"
        subtitle="Sessions pilotées par IA, avatar Beyond Presence, scoring temps réel et feedback actionnable."
        className="text-center md:text-left"
      >
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
          <BentoCard padding="lg" className="text-left">
            <div className="space-y-5">
              <p className="text-lg text-slate-200/90">
                Choisissez votre secteur, rôle et niveau. FinanceBro orchestre un plan d&apos;entretien
                dynamique : briefing sectoriel, avatar WebRTC, transcription et scoring multi-axes.
              </p>
              <LandingActions />
              <div className="grid gap-4 md:grid-cols-3">
                <div className="float-card p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/70">Realtime</p>
                  <p className="mt-2 text-sm text-slate-100">
                    Audio bidirectionnel, prompts fonctionnels et micro-expressions pilotées.
                  </p>
                </div>
                <div className="float-card p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/70">
                    Feedback
                  </p>
                  <p className="mt-2 text-sm text-slate-100">
                    Rapport 9 axes + plan d&apos;entrainement 7 jours, export PDF et historique.
                  </p>
                </div>
                <div className="float-card p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/70">Heatmap</p>
                  <p className="mt-2 text-sm text-slate-100">
                    Visualisez les progrès par thème, latence moyenne et précision chiffrée.
                  </p>
                </div>
              </div>
            </div>
          </BentoCard>
          <BentoCard padding="md" emphasis="primary" className="flex flex-col gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-emerald-200/70">
                Progression
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-50">
                +33 points sur l&apos;axe technique en 6 semaines
              </h3>
            </div>
            <ProgressionChart />
            <div className="rounded-[var(--radius)] border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="font-medium text-emerald-200">Avis candidats</p>
              <p className="mt-2 italic text-slate-300/80">
                “Le meilleur coach IA pour les entretiens finance. L&apos;avatar est bluffant et le
                feedback ultra actionnable.” — Marie, Analyste M&A.
              </p>
            </div>
          </BentoCard>
        </div>
      </Section>

      <Section
        eyebrow="Parcours"
        title="Un flux piloté par Excalidraw"
        subtitle="Le diagramme flow.excalidraw est la source de vérité pour le routage et les états produit."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <BentoCard padding="lg">
            <p className="text-sm text-slate-200">
              Le flux “site” décrit les transitions clefs de la landing page vers les écrans pricing,
              contact, pré-entretien et feedback. Chaque noeud est mappé à une route App Router.
            </p>
            {siteFlow ? (
              <ul className="mt-4 grid gap-2 text-sm text-slate-300">
                {siteFlow.nodes.map((node) => (
                  <li key={node.id} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-medium">{node.title}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-rose-200">
                Impossible de charger le flux. Vérifiez le fichier public/flow.excalidraw.
              </p>
            )}
          </BentoCard>
          <BentoCard padding="lg">
            <p className="text-sm text-slate-200">
              Les arêtes définissent les CTA et transitions d&apos;écran. L&apos;IA temps réel utilise un flux
              dédié “interview” pour organiser briefing, session, scoring et dashboard.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              {siteFlow
                ? siteFlow.edges.slice(0, 6).map((edge, index) => (
                    <div
                      key={`${edge.from}-${edge.to}-${index}`}
                      className="flex items-center gap-3 rounded-[var(--radius)] border border-white/10 bg-white/5 p-3"
                    >
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase text-emerald-200/80">
                        {edge.from}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-emerald-200">{edge.to}</span>
                    </div>
                  ))
                : null}
            </div>
            <Link
              href="/pre"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
            >
              Lancer le questionnaire →
            </Link>
          </BentoCard>
        </div>
      </Section>
    </div>
  );
}
