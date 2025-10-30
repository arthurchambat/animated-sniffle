import Link from "next/link";
import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function AnalysisPage() {
  return (
    <Section
      eyebrow="Analysis"
      title="Analyse de votre interview"
      subtitle="Consultez les feedbacks macro et question par question, puis générez le PDF."
      className="gap-8"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <BentoCard padding="lg" className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-50">General Feedback</h3>
          <p className="text-sm text-slate-300/80">
            Résumé exécutif, forces, priorités et plan d&apos;entrainement 7 jours.
          </p>
          <Button asChild>
            <Link href="/feedback/general">Voir le feedback</Link>
          </Button>
        </BentoCard>
        <BentoCard padding="lg" className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-50">Question by question</h3>
          <p className="text-sm text-slate-300/80">
            Analyse granularisée : attentes, écart et scoring par item.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/feedback/questions">Explorer les questions</Link>
          </Button>
        </BentoCard>
        <BentoCard padding="lg" className="flex flex-col gap-3">
          <h3 className="text-lg font-semibold text-slate-50">Download</h3>
          <p className="text-sm text-slate-300/80">
            Export PDF ou Markdown, partagez-le avec vos mentors et suivez la progression.
          </p>
          <Button variant="outline" asChild>
            <Link href="/feedback/download">Download PDF Feedback</Link>
          </Button>
        </BentoCard>
      </div>
      <div className="bento-card p-6">
        <h3 className="text-sm font-semibold text-slate-50">What to improve</h3>
        <p className="mt-2 text-sm text-slate-300/80">
          Travaillez le drill-down chiffré, réduisez la latence sur les questions de structuration
          et renforcez vos références marché (macro, deals récents, Fed/ECB).
        </p>
      </div>
    </Section>
  );
}
