'use client';

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";

const plans = [
  {
    name: "Basic",
    price: "Gratuit",
    frequency: "pour démarrer",
    description: "1 session IA/mois avec rapport synthétique et axes clés.",
    features: [
      "Mock interview IA mensuelle",
      "Transcription + axes d'amélioration",
      "Benchmarks finance essentiels"
    ],
    cta: { href: "/auth/sign-in", label: "Tester" },
    highlighted: false
  },
  {
    name: "Medium",
    price: "79€",
    frequency: "par mois",
    description: "Pack intensif pour préparer la saison de recrutement IB/PE.",
    features: [
      "4 sessions IA/mois avec scénarios adaptatifs",
      "Scoring multi-axes + coaching priorisé",
      "Exports analytics et suivi des progrès"
    ],
    cta: { href: "/pricing", label: "Choisir Medium" },
    highlighted: true
  },
  {
    name: "Pro",
    price: "149€",
    frequency: "par mois",
    description: "Pour les candidats exigeants ou programmes carrières écoles.",
    features: [
      "Sessions illimitées",
      "Débrief coach humain (30 min/mois)",
      "Playbooks M&A / PE / Marchés & exports illimités"
    ],
    cta: { href: "/pricing", label: "Choisir Pro" },
    highlighted: false
  }
];

export function PricingSection() {
  const shouldReduceMotion = useReducedMotion();
  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0.4, y: 24 };
  const motionWhileInView = shouldReduceMotion ? undefined : { opacity: 1, y: 0 };
  const motionTransition = shouldReduceMotion ? undefined : { duration: 0.24, ease: "easeOut" };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan, index) => {
        const isHighlighted = plan.highlighted;
        return (
          <m.div
            key={plan.name}
            initial={motionInitial}
            whileInView={motionWhileInView}
            viewport={{ once: true, amount: 0.4 }}
            transition={motionTransition ? { ...motionTransition, delay: index * 0.08 } : undefined}
            className={
              isHighlighted
                ? "flex h-full flex-col gap-6 rounded-3xl border border-white/40 bg-[#0a0f1f] p-6 text-white shadow-[0_18px_40px_rgba(10,15,31,0.3)]"
                : "flex h-full flex-col gap-6 rounded-3xl border border-[#0a0f1f1a] bg-white/90 p-6 text-[#0a0f1f] shadow-[0_16px_35px_rgba(10,15,31,0.08)]"
            }
          >
            {isHighlighted ? (
              <span className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                Populaire
              </span>
            ) : null}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <p className={isHighlighted ? "text-sm text-white/70" : "text-sm text-[#0a0f1f]/70"}>
                {plan.description}
              </p>
            </div>
            <div className={isHighlighted ? "space-y-1 text-white" : "space-y-1 text-[#0a0f1f]"}>
              <p className="text-3xl font-semibold">{plan.price}</p>
              <p className="text-xs uppercase tracking-[0.3em] opacity-70">{plan.frequency}</p>
            </div>
            <ul className={isHighlighted ? "flex flex-1 flex-col gap-3 text-sm text-white/80" : "flex flex-1 flex-col gap-3 text-sm text-[#0a0f1f]/80"}>
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span aria-hidden="true" className={isHighlighted ? "mt-1.5 h-1.5 w-1.5 rounded-full bg-white" : "mt-1.5 h-1.5 w-1.5 rounded-full bg-[#0a0f1f]"} />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.cta.href}
              className={
                isHighlighted
                  ? "inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#0a0f1f] transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  : "inline-flex items-center justify-center rounded-full bg-[#0a0f1f] px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-[#0a0f1f]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0f1f]/60"
              }
            >
              {plan.cta.label}
            </Link>
          </m.div>
        );
      })}
    </div>
  );
}
