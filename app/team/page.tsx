import { Section } from "@/components/ui/section";

const advisors = [
  {
    name: "Christopher",
    firm: "Morgan Stanley",
    role: "Head of Sales & Trading",
    bio: "15 ans sur les marchés, mentor pour nos scénarios de stress et drill-down timing."
  },
  {
    name: "Arthur",
    firm: "FinanceBro",
    role: "Co-founder / PM",
    bio: "Pilote la roadmap AI Realtime & l'intégration Beyond Presence."
  },
  {
    name: "Patricia",
    firm: "Morgan Stanley",
    role: "MD M&A Europe",
    bio: "Référence pour les playbooks coverage, fit et storytelling transactions."
  },
  {
    name: "Patrick",
    firm: "Goldman Sachs",
    role: "Partner - PE Advisory",
    bio: "Apporte son expertise buyout & growth ainsi que les KPIs de rigueur chiffrage."
  },
  {
    name: "Paul",
    firm: "JP Morgan",
    role: "Executive Director - IB",
    bio: "Coach nos modules coverage, coverage tech et training analystes."
  }
];

export default function TeamPage() {
  return (
    <Section
      eyebrow="Advisors"
      title="Notre équipe & advisors"
      subtitle="Un collectif de MD, partners et coachs qui construisent les scénarios et grilles de feedback."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {advisors.map((advisor) => (
          <div key={advisor.name} className="float-card p-6">
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-200/70">
              {advisor.firm}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-50">{advisor.name}</h2>
            <p className="text-sm text-emerald-200/80">{advisor.role}</p>
            <p className="mt-4 text-sm text-slate-300/80">{advisor.bio}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
