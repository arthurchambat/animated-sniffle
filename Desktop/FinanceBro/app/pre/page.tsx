import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { PreInterviewForm } from "@/components/pre/pre-form";

export default function PreInterviewPage() {
  return (
    <Section
      eyebrow="Questionnaire"
      title="Briefing pré-entretien"
      subtitle="Nous calibrons la session IA selon ton process, le rôle et les attentes de la banque."
      className="gap-8"
    >
      <BentoCard padding="lg" className="mx-auto w-full max-w-3xl">
        <PreInterviewForm />
      </BentoCard>
    </Section>
  );
}
