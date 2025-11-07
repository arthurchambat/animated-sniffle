'use client';

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";

const plans = [
  {
    name: "Pack Découverte",
    price: "5€",
    frequency: "pack unique",
    description: "Teste FinanceBro avec un premier entretien complet et feedback personnalisé.",
    features: [
      "1 entretien IA complet",
      "Feedback détaillé instantané",
      "Scoring sur 9 axes finance",
      "Export PDF du rapport"
    ],
    cta: { href: "/auth/sign-in", label: "Découvrir" },
    highlighted: false
  },
  {
    name: "Pack Intensif",
    price: "29€",
    frequency: "2h de préparation",
    description: "Le pack idéal pour préparer efficacement tes entretiens en IB/PE.",
    features: [
      "4 entretiens IA complets",
      "Feedback détaillé après chaque session",
      "Marges de progression personnalisées",
      "Plan d'entraînement 7 jours",
      "Benchmarks vs analystes IB/PE"
    ],
    cta: { href: "/pricing", label: "Choisir Intensif" },
    highlighted: true
  },
  {
    name: "Pack Pro",
    price: "69€",
    frequency: "5h de préparation",
    description: "Préparation complète pour candidats exigeants et postes top-tier.",
    features: [
      "Préparation complète 5h",
      "Entretiens illimités pendant 30 jours",
      "Tous les templates (M&A, PE, Marchés)",
      "Coaching priorisé et suivi personnalisé",
      "Analytics avancés et exports illimités"
    ],
    cta: { href: "/pricing", label: "Choisir Pro" },
    highlighted: false
  }
];

export function PricingSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan, index) => {
        const isHighlighted = plan.highlighted;
        return (
          <m.div
            key={plan.name}
            {...(shouldReduceMotion
              ? {}
              : {
                  initial: { opacity: 0.4, y: 24 },
                  whileInView: { opacity: 1, y: 0 },
                  transition: { duration: 0.24, ease: "easeOut", delay: index * 0.08 }
                })}
            viewport={{ once: true, amount: 0.4 }}
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
