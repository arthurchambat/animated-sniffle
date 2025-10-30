'use client';

import Link from "next/link";
import { m } from "framer-motion";

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
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan, index) => (
        <m.div
          key={plan.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, delay: index * 0.15 }}
          className="flex h-full flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-emerald-500/10"
        >
          {plan.highlighted ? (
            <span className="inline-flex w-fit items-center rounded-full bg-emerald-400/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-200">
              Populaire
            </span>
          ) : null}
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
            <p className="text-sm text-slate-300/90">{plan.description}</p>
          </div>
          <div className="space-y-1 text-slate-100">
            <p className="text-3xl font-semibold">{plan.price}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{plan.frequency}</p>
          </div>
          <ul className="flex flex-1 flex-col gap-3 text-sm text-slate-200/90">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-300" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link
            href={plan.cta.href}
            className={
              plan.highlighted
                ? "inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
                : "inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100 transition hover:border-emerald-300/40 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            }
          >
            {plan.cta.label}
          </Link>
        </m.div>
      ))}
    </div>
  );
}
