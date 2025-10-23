import Link from "next/link";
import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { getQuestions } from "@/lib/questions";

const expectedAnswers = {
  technical: "Décomposer la méthodologie, chiffrer, mentionner les drivers clés.",
  marche: "Relier macro, micro et impact deals, apporter une vue chiffrée.",
  fit: "Suivre STAR, illustrer leadership et impact concret.",
  brainteaser: "Structurer la réflexion, poser les hypothèses, chiffrer étapes."
} as const;

const sampleScores = [82, 74, 68, 77, 84, 71];

export default function FeedbackQuestionsPage() {
  const sample = getQuestions("market_finance", "sales_trading", "analyst").slice(0, 6);

  return (
    <Section
      eyebrow="Feedback"
      title="Question by question analysis"
      subtitle="Comparez vos réponses avec les attentes, suivez le scoring et générez le PDF."
      className="gap-8"
    >
      <div className="overflow-hidden rounded-[var(--radius)] border border-white/10">
        <table className="min-w-full divide-y divide-white/10 text-sm text-slate-200">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-slate-300/70">
            <tr>
              <th className="px-4 py-3 text-left">Question</th>
              <th className="px-4 py-3 text-left">Votre réponse</th>
              <th className="px-4 py-3 text-left">Attentes</th>
              <th className="px-4 py-3 text-left">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-white/5">
            {sample.map((question, index) => (
              <tr key={question.id} className="align-top">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-50">{question.prompt}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                    {question.type} - {question.difficulty}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-slate-200">
                    Réponse #{index + 1} — à compléter via transcript (latence 3.2s, WPM 148).
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-emerald-200/90">{expectedAnswers[question.type]}</p>
                </td>
                <td className="px-4 py-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                    {sampleScores[index % sampleScores.length]}/100
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <BentoCard padding="lg">
          <h3 className="text-sm font-semibold text-slate-50">Actions</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li>- Renforcer la précision chiffrée sur les réponses techniques.</li>
            <li>- Ajouter un call-to-action sur la gestion du stress.</li>
          </ul>
        </BentoCard>
        <BentoCard padding="lg">
          <h3 className="text-sm font-semibold text-slate-50">Latence & Drill-down</h3>
          <p className="mt-2 text-sm text-slate-300/80">
            Latence moyenne 3.4s, pics jusqu&apos;à 5.6s sur les brainteasers. Prévoir un entraînement
            vocal minuteur.
          </p>
        </BentoCard>
      </div>
      <Button variant="outline" asChild>
        <Link href="/feedback/download">Download PDF Feedback</Link>
      </Button>
    </Section>
  );
}
