'use client';

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";

interface FinalCTAProps {
  ctaHref: string;
}

export function FinalCTA({ ctaHref }: FinalCTAProps) {
  const shouldReduceMotion = useReducedMotion();
  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0.4, scale: 0.96 };
  const motionWhileInView = shouldReduceMotion ? undefined : { opacity: 1, scale: 1 };
  const motionTransition = shouldReduceMotion ? undefined : { duration: 0.24, ease: "easeOut" };

  return (
    <m.section
      initial={motionInitial}
      whileInView={motionWhileInView}
      viewport={{ once: true, amount: 0.4 }}
      transition={motionTransition}
      className="relative overflow-hidden rounded-[32px] border border-white/30 bg-[#0a0f1f] p-12 text-center text-white shadow-[0_24px_50px_rgba(10,15,31,0.35)]"
    >
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-6">
        <span className="text-xs uppercase tracking-[0.45em] text-white/70">
          Prêt pour l'offre ?
        </span>
        <h3 className="text-3xl font-semibold md:text-4xl">
          Lance ta prochaine simulation avec le coach IA préféré des candidats en finance
        </h3>
        <p className="text-base text-white/70 md:text-lg">
          Rejoins les candidats qui ont sécurisé offres et stages dans les meilleures banques,
          boutiques M&A et fonds. Accède immédiatement à la bibliothèque de scénarios finance.
        </p>
        <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-[#0a0f1f] transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Commencer la session
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:border-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Voir les plans
          </Link>
        </div>
      </div>
    </m.section>
  );
}
