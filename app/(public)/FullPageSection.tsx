'use client';

import { useEffect, useMemo, useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type SectionTheme = "dark" | "light";

interface FullPageSectionProps extends HTMLAttributes<HTMLElement> {
  id: string;
  theme?: SectionTheme;
  contentClassName?: string;
  children: ReactNode;
  backgroundVideoSrc?: string;
  backgroundVideoPlaybackRate?: number;
}

export function FullPageSection({
  id,
  theme = "dark",
  className,
  contentClassName,
  children,
  backgroundVideoSrc,
  backgroundVideoPlaybackRate = 1,
  ...rest
}: FullPageSectionProps) {
  const isDark = theme === "dark";
  const shouldReduceMotion = useReducedMotion();
  const [preferStatic, setPreferStatic] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-data: reduce)");
    setPreferStatic(media.matches);

    const handler = (event: MediaQueryListEvent) => setPreferStatic(event.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }

    if (typeof (media as any).addListener === "function") {
      (media as any).addListener(handler);
      return () => (media as any).removeListener(handler);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.playbackRate = backgroundVideoPlaybackRate;
  }, [backgroundVideoPlaybackRate, preferStatic, shouldReduceMotion]);

  const showVideo = Boolean(backgroundVideoSrc) && !preferStatic && !shouldReduceMotion;
  const overlayClassName = useMemo(
    () =>
      cn(
        "absolute inset-0",
        isDark ? "bg-[#0a0f1f]/70" : "bg-white/70"
      ),
    [isDark]
  );

  return (
    <section
      id={id}
      data-theme={theme}
      className={cn(
        // Conteneur plein écran avec snap STRICT
        "relative isolate flex h-dvh snap-start snap-always flex-col overflow-hidden",
        // Fond bleu foncé pour TOUTES les sections (ajustable ici via --section-bg)
        "bg-[#0a0f1f] text-white",
        // Séparateurs blancs épais en haut et bas (épaisseur ajustable via --separator-h)
        "before:absolute before:left-0 before:right-0 before:top-0 before:z-50 before:h-1 before:bg-white before:content-['']",
        "after:absolute after:bottom-0 after:left-0 after:right-0 after:z-50 after:h-1 after:bg-white after:content-['']",
        className
      )}
      style={{ scrollSnapStop: "always" }}
      {...rest}
    >
      {showVideo ? (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
          <video
            ref={videoRef}
            src={backgroundVideoSrc}
            className="h-full w-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            style={{ filter: "grayscale(100%)" }}
          />
          <span className={overlayClassName} />
        </div>
      ) : null}

      <div
        className="relative z-10 flex flex-1 items-center justify-center"
        style={{ minHeight: "calc(100dvh - var(--header-h, 72px))" }}
      >
        <div className={cn("mx-auto w-full max-w-5xl px-6 py-16 md:px-10 md:py-20 xl:px-16", contentClassName)}>
          {children}
        </div>
      </div>
    </section>
  );
}
