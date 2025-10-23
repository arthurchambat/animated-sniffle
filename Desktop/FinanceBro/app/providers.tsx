"use client";

import { LazyMotion, MotionConfig } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "sonner";

const loadMotionFeatures = () => import("@/lib/motion/features").then((mod) => mod.default);

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  return (
    <MotionConfig reducedMotion={reduced ? "always" : "never"}>
      <LazyMotion features={loadMotionFeatures} strict>
        {children}
        <Toaster theme="dark" position="top-right" richColors />
      </LazyMotion>
    </MotionConfig>
  );
}
