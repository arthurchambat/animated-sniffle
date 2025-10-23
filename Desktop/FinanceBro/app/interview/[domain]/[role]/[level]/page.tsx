import Link from "next/link";
import { notFound } from "next/navigation";
import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { getQuestions, listDomains, listLevels, listRoles } from "@/lib/questions";

interface InterviewPageProps {
  params: { domain: string; role: string; level: string };
}

const axis = [
  "Technique",
  "Structuration",
  "Rigueur chiffrage",
  "Communication & clarté",
  "Marché/Actu",
  "Stress management",
  "Concision",
  "Storytelling",
  "Impact"
];

export default function InterviewPage({ params }: InterviewPageProps) {
  const { domain, role, level } = params;
  if (!listDomains().includes(domain)) {
    notFound();
  }
  if (!listRoles(domain).includes(role)) {
    notFound();
  }
  if (!listLevels(domain, role).includes(level)) {
    notFound();
  }

  const questions = getQuestions(domain, role, level).slice(0, 8);

  return (
    <Section
      eyebrow="Interview"
      title={`Session ${role.replace("_", " ")} — ${domain.replace("_", " ")}`}
      subtitle={`Niveau ${level}. Sélection dynamique de 30 questions, scoring en direct et CTA feedback.`}
      className="gap-8"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <BentoCard padding="lg" className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-100">Plan d&apos;entretien</h3>
          <ol className="space-y-3 text-sm text-slate-200">
            {questions.map((question, index) => (
              <li key={question.id} className="rounded-[var(--radius)] bg-white/5 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                  {index + 1}. {question.type} - {question.difficulty}
                </p>
                <p className="mt-1 text-sm text-slate-100">{question.prompt}</p>
              </li>
            ))}
          </ol>
        </BentoCard>
        <BentoCard padding="lg" className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-100">Axes de scoring</h3>
          <ul className="space-y-2 text-sm text-slate-200">
            {axis.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {item}
              </li>
            ))}
          </ul>
          <Button asChild>
            <Link href="/run">Lancer la session en temps réel</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/analysis">Terminer et générer feedback</Link>
          </Button>
        </BentoCard>
      </div>
    </Section>
  );
}
