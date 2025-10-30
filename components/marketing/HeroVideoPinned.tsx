'use client';

import { useEffect, useRef, useState } from "react";
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

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

  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0.4, y: 24 };
  const motionAnimate = shouldReduceMotion ? undefined : { opacity: 1, y: 0 };
  const motionTransition = shouldReduceMotion ? undefined : { duration: 0.24, ease: "easeOut" };

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.playbackRate = 0.85;
  }, [preferStatic, shouldReduceMotion]);

  return (
    <div className="relative isolate flex h-full w-full flex-col justify-center overflow-hidden bg-[#0a0f1f]">
      {!preferStatic && !shouldReduceMotion ? (
        <video
          ref={videoRef}
          src="/videos/video-interview.mp4"
          preload="metadata"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-poster.svg"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "grayscale(100%)" }}
          aria-hidden="true"
        />
      ) : null}

      <div className="absolute inset-0 bg-[#0a0f1f]/80" aria-hidden="true" />

      {preferStatic || shouldReduceMotion ? (
        <div className="absolute inset-0" aria-hidden="true">
          <Image src="/images/hero-poster.svg" alt="" fill priority className="object-cover" />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 md:px-10 md:py-24 xl:px-16">
        <m.span
          initial={motionInitial}
          animate={motionAnimate}
          transition={motionTransition}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70"
        >
          Coach IA vidéo
        </m.span>

        <m.h1
          initial={motionInitial}
          animate={motionAnimate}
          transition={motionTransition}
          className="text-4xl font-semibold leading-tight text-white md:text-6xl"
        >
          Prépare tes entretiens finance avec un coach IA vidéo
        </m.h1>

        <m.p
          initial={motionInitial}
          animate={motionAnimate}
          transition={motionTransition}
          className="max-w-2xl text-base text-white/70 md:text-xl"
        >
          Passe des interviews simulées et reçois un rapport précis et actionnable. Chaque session est
          adaptée à ton poste cible et calibrée pour les standards des banques et fonds.
        </m.p>

        <m.div
          initial={motionInitial}
          animate={motionAnimate}
          transition={motionTransition}
          className="mt-4 flex flex-wrap items-center gap-4"
        >
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#0a0f1f] transition hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Commencer la session
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="#value"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-white transition hover:border-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            Découvrir les bénéfices
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </m.div>
      </div>
    </div>
  );
}
