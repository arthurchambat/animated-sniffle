import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { DownloadPanel } from "@/components/feedback/download-panel";

export default function FeedbackDownloadPage() {
  return (
    <Section
      eyebrow="Export"
      title="Download PDF Feedback"
      subtitle="Générez le feedback détaillé pour vos mentors ou pour votre suivi interne."
      className="gap-8"
    >
      <BentoCard padding="lg" className="mx-auto max-w-2xl">
        <DownloadPanel />
      </BentoCard>
    </Section>
  );
}
