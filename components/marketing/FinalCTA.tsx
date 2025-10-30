'use client';

import Link from "next/link";
import { m } from "framer-motion";

interface FinalCTAProps {
  ctaHref: string;
}

export function FinalCTA({ ctaHref }: FinalCTAProps) {
  return (
    <m.section
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden rounded-[44px] border border-emerald-400/40 bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-transparent p-12 text-center shadow-2xl shadow-emerald-500/20"
    >
      <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-400/35 blur-3xl" />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-6 text-slate-100">
        <span className="text-xs uppercase tracking-[0.45em] text-emerald-200/90">
          Prêt pour l&apos;offre ?
        </span>
        <h3 className="text-3xl font-semibold md:text-4xl">
          Lance ta prochaine simulation avec le coach IA préféré des candidats en finance
        </h3>
        <p className="text-base text-slate-200/90 md:text-lg">
          Rejoins les candidats qui ont sécurisé offres et stages dans les meilleures banques,
          boutiques M&A et fonds. Accède immédiatement à la bibliothèque de scénarios finance.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-emerald-300 px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Commencer la session
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-white/25 px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100 transition hover:border-emerald-300/40 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Voir les plans
          </Link>
        </div>
      </div>
    </m.section>
  );
}
