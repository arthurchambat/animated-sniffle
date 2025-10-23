import { BentoCard } from "@/components/ui/bento-card";
import { Section } from "@/components/ui/section";
import { RealtimeSession } from "@/components/run/realtime-session";
import { getQuestions } from "@/lib/questions";

export default function RunInterviewPage() {
  const prepQuestions = getQuestions("market_finance", "sales_trading", "analyst").slice(0, 5);

  return (
    <Section
      eyebrow="Session"
      title="Run Interview"
      subtitle="Avatar Beyond Presence, OpenAI Realtime et scoring live orchestrent votre mock interview."
      className="gap-10"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <BentoCard padding="lg">
            <h3 className="text-sm font-semibold text-slate-50">Brief sectoriel</h3>
            <p className="mt-2 text-sm text-slate-300/80">
              Focus Market Finance — Sales &amp; Trading. Expect questions sur les flux Fixed Income,
              stress tests intraday, volatilité implicite et régulation MIFID II.
            </p>
          </BentoCard>
          <BentoCard padding="lg">
            <h3 className="text-sm font-semibold text-slate-50">Fiches mnémotechniques</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {prepQuestions.map((question) => (
                <li key={question.id} className="rounded-[var(--radius)] bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-emerald-200/70">
                    {question.type} - {question.difficulty}
                  </p>
                  <p className="mt-1 text-sm text-slate-100">{question.prompt}</p>
                </li>
              ))}
            </ul>
          </BentoCard>
        </div>
        <RealtimeSession />
      </div>
    </Section>
  );
}
