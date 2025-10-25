'use client';

import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroVideoPinnedProps {
  ctaHref: string;
}

export function HeroVideoPinned({ ctaHref }: HeroVideoPinnedProps) {
  const shouldReduceMotion = useReducedMotion();
  const [preferStatic, setPreferStatic] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-data: reduce)");
    setPreferStatic(media.matches);
    const handler = (event: MediaQueryListEvent) => setPreferStatic(event.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative isolate flex h-full w-full items-center overflow-hidden rounded-[44px] border border-white/10 bg-slate-950">
      {!preferStatic && !shouldReduceMotion ? (
        <video
          src="/videos/finance-hero.mp4"
          preload="metadata"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.svg"
          className="absolute inset-0 hidden h-full w-full object-cover motion-safe:block"
          aria-hidden="true"
        />
      ) : null}

      <div className="absolute inset-0 block motion-safe:hidden" aria-hidden="true">
        <Image
          src="/images/hero-poster.svg"
          alt=""
          fill
          priority
          className="object-cover"
        />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/85 via-slate-950/60 to-slate-950/50" />

      <div className="relative z-10 w-full px-6 py-16 md:px-12 md:py-24">
        <m.span
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.45em] text-emerald-200"
        >
          Coach IA vidéo
        </m.span>

        <m.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.7, ease: "easeOut" }}
          className="mt-7 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-6xl"
        >
          Prépare tes entretiens finance avec un coach IA vidéo
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: "easeOut" }}
          className="mt-6 max-w-2xl text-lg text-slate-200/95 md:text-2xl"
        >
          Passe des interviews simulées et reçois un rapport précis et actionnable. Chaque session
          est adaptée à ton poste cible et calibrée pour les standards des banques et fonds.
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.7, ease: "easeOut" }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-3 rounded-full bg-emerald-400 px-8 py-3 text-base font-semibold uppercase tracking-[0.35em] text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Commencer la session
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="#value"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-100 transition hover:border-emerald-200 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            Découvrir les bénéfices
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </m.div>
      </div>
    </div>
  );
}
