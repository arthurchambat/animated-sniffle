import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/ui/section";

const plans = [
  {
    name: "Basic",
    price: "20€",
    description: "1 mock interview mensuelle, feedback condensé, replay audio.",
    features: [
      "Briefing sectoriel personnalisé",
      "Avatar Beyond Presence en 720p",
      "Feedback express (3 axes)"
    ],
    checkout: "https://checkout.stripe.com/pay/basic"
  },
  {
    name: "Medium",
    price: "50€",
    description: "3 sessions, scoring complet 9 axes, export PDF détaillé.",
    features: [
      "Plan d'entretien dynamique",
      "Transcript annoté + NER",
      "Heatmap progression + KPIs"
    ],
    checkout: "https://checkout.stripe.com/pay/medium",
    highlighted: true
  },
  {
    name: "Pro",
    price: "90€",
    description: "Sessions illimitées, onboarding coach, analytics avancées.",
    features: [
      "Avatar Beyond Presence 4K + gestuelle avancée",
      "Exports API + Webhooks",
      "Support prioritaire 24/7"
    ],
    checkout: "https://checkout.stripe.com/pay/pro"
  }
];

export default function PricingPage() {
  return (
    <Section
      eyebrow="Plans"
      title="Choisissez votre cadence d'entraînement"
      subtitle="Des formules pensées pour les stages, analystes en process et associates en latéral."
      className="gap-10"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <BentoCard
            key={plan.name}
            className="flex flex-col gap-6"
            emphasis={plan.highlighted ? "primary" : "default"}
          >
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-slate-50">{plan.name}</h2>
              <p className="text-3xl font-bold text-emerald-300">{plan.price}</p>
              <p className="text-sm text-slate-300/80">{plan.description}</p>
            </div>
            <ul className="space-y-2 text-sm text-slate-100">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  {feature}
                </li>
              ))}
            </ul>
            <form action={plan.checkout} method="POST" className="mt-auto">
              <Button className="w-full" variant={plan.highlighted ? "primary" : "secondary"}>
                Subscribe
              </Button>
            </form>
          </BentoCard>
        ))}
      </div>
    </Section>
  );
}
