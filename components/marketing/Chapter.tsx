'use client';

import { m, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChapterVariant = "dark" | "light";

interface ChapterProps {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  align?: "center" | "left";
  variant?: ChapterVariant;
}

export function Chapter({
  eyebrow,
  title,
  description,
  children,
  align = "left",
  variant = "dark"
}: ChapterProps) {
  const shouldReduceMotion = useReducedMotion();
  const isCenter = align === "center";
  const isDark = variant === "dark";

  const containerClass = cn(
    "mx-auto flex w-full max-w-5xl flex-col gap-8",
    isCenter ? "items-center text-center" : "items-start text-left",
    isDark ? "text-white" : "text-[#0a0f1f]"
  );

  const eyebrowClass = cn(
    "text-xs font-semibold uppercase tracking-[0.35em]",
    isDark ? "text-white/70" : "text-[#0a0f1f]/70"
  );

  const descriptionClass = cn(
    "text-base md:text-lg",
    isDark ? "text-white/70" : "text-[#0a0f1f]/70",
    isCenter ? "mx-auto max-w-2xl" : "max-w-2xl"
  );

  const motionInitial = shouldReduceMotion ? undefined : { opacity: 0.4, y: 24 };
  const motionWhileInView = shouldReduceMotion ? undefined : { opacity: 1, y: 0 };
  const motionTransition = shouldReduceMotion ? undefined : { duration: 0.24, ease: "easeOut" };

  return (
    <div className={containerClass}>
      {eyebrow ? (
        <m.span initial={motionInitial} whileInView={motionWhileInView} viewport={{ once: true, amount: 0.5 }} transition={motionTransition} className={eyebrowClass}>
          {eyebrow}
        </m.span>
      ) : null}

      <m.h2
        initial={motionInitial}
        whileInView={motionWhileInView}
        viewport={{ once: true, amount: 0.4 }}
        transition={motionTransition}
        className={cn("text-3xl font-semibold md:text-4xl", isCenter ? "mx-auto max-w-3xl" : "max-w-3xl")}
      >
        {title}
      </m.h2>

      {description ? (
        <m.p
          initial={motionInitial}
          whileInView={motionWhileInView}
          viewport={{ once: true, amount: 0.4 }}
          transition={motionTransition}
          className={descriptionClass}
        >
          {description}
        </m.p>
      ) : null}

      {children ? (
        <m.div
          initial={motionInitial}
          whileInView={motionWhileInView}
          viewport={{ once: true, amount: 0.3 }}
          transition={motionTransition}
          className={cn(isCenter ? "mx-auto w-full" : "w-full")}
        >
          {children}
        </m.div>
      ) : null}
    </div>
  );
}
