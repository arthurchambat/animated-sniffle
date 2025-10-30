import { notFound } from "next/navigation";
import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

interface FeedbackPageProps {
  params: { sessionId: string };
}

export default async function FeedbackSessionPage({ params }: FeedbackPageProps) {
  const supabase = getSupabaseAdminClient();
  let feedback: { md_text: string; summary?: string | null } | null = null;

  if (supabase) {
    const { data } = await supabase
      .from("feedbacks")
      .select("md_text, summary")
      .eq("session_id", params.sessionId)
      .maybeSingle();
    feedback = data;
  }

  if (!feedback) {
    // Provide a graceful fallback if no record yet
    feedback = {
      md_text:
        "## Feedback indisponible\nLa session n'a pas encore généré de rapport. Revenez après l'analyse IA.",
      summary: null
    };
  }

  if (!params.sessionId) {
    notFound();
  }

  return (
    <Section
      eyebrow="Feedback"
      title={`Session ${params.sessionId}`}
      subtitle="Consultez la synthèse Markdown enregistrée en base."
      className="gap-6"
    >
      <BentoCard padding="lg" className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap text-sm text-slate-200">{feedback.md_text}</pre>
      </BentoCard>
    </Section>
  );
}
