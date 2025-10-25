'use client';

import { useEffect } from "react";

interface UseLenisOptions {
  enabled?: boolean;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const prefersReducedData = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-data: reduce)").matches;

export function useLenis(options: UseLenisOptions = {}) {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    if (prefersReducedMotion() || prefersReducedData()) {
      return;
    }

    const connection = (navigator as any)?.connection;
    if (connection?.saveData) {
      return;
    }

    let lenis: any;
    let rafId: number | null = null;
    let cancelled = false;

    const startLenis = async () => {
      const { default: Lenis } = await import("lenis");
      if (cancelled) {
        return;
      }

      lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        duration: 1.2,
        smoothTouch: false
      });

      const onRaf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(onRaf);
      };

      rafId = requestAnimationFrame(onRaf);
    };

    startLenis().catch((error) => {
      console.error("[FinanceBro] Lenis initialisation failed", error);
    });

    return () => {
      cancelled = true;
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      lenis?.destroy?.();
    };
  }, [enabled]);
}
