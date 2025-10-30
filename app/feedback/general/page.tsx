import Link from "next/link";
import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

const strengths = [
  "Narration structurée sur les deals récents.",
  "Bonne gestion des relances techniques (greeks, stress tests).",
  "Communication claire avec chiffres précis."
];

const priorities = [
  "Accélérer la prise de parole (< 2.5s de latence).",
  "Renforcer les références marché (macro US/Europe).",
  "Développer des exemples comportementaux + impact mesurable."
];

const errors = [
  "Confusion sur la duration vs. convexity sur les portefeuilles IG.",
  "Oublie du calcul de bridging items sur le cash flow statement.",
  "Manque de structuration dans l'answer sur la gouvernance deal comité crédit."
];

const plan = [
  "Jour 1 : Review DCF & multiples sectoriels (IB/PE).",
  "Jour 2 : Drill down structuration produits dérivés.",
  "Jour 3 : Mock audio 15 min sur brainteasers mentaux.",
  "Jour 4 : Lecture macro (Fed/ECB) + pitch marché 2 min.",
  "Jour 5 : Feedback pair + correction storytelling STAR.",
  "Jour 6 : Session Beyond Presence 20 min (focus latence).",
  "Jour 7 : Synthèse, plan d'actions et envoi à mentor."
];

export default function FeedbackGeneralPage() {
  return (
    <Section
      eyebrow="Feedback"
      title="General Feedback"
      subtitle="Synthèse de la session mock interview avec recommandations actionnables."
      className="gap-8"
    >
      <BentoCard padding="lg" emphasis="primary">
        <h2 className="text-lg font-semibold text-slate-50">Résumé exécutif</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          <li>- Solide maîtrise des flows IB, besoin de renforcer la précision marchés.</li>
          <li>- Latence moyenne 3.4s, objectif 2.5s.</li>
          <li>- Impact narratif à consolider sur les exemples leadership.</li>
        </ul>
      </BentoCard>

      <div className="grid gap-6 md:grid-cols-2">
        <BentoCard padding="lg">
          <h3 className="text-sm font-semibold text-emerald-200">Forces</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {strengths.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </BentoCard>
        <BentoCard padding="lg">
          <h3 className="text-sm font-semibold text-amber-200">Travailler en priorité</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            {priorities.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </BentoCard>
      </div>

      <BentoCard padding="lg">
        <h3 className="text-sm font-semibold text-rose-200">Erreurs techniques à corriger</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {errors.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </BentoCard>

      <BentoCard padding="lg">
        <h3 className="text-sm font-semibold text-slate-100">Plan d&apos;entraînement 7 jours</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {plan.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </BentoCard>

      <Button variant="outline" asChild>
        <Link href="/feedback/download">Download PDF Feedback</Link>
      </Button>
    </Section>
  );
}
