'use client';

import { m } from "framer-motion";
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
  const containerClass = cn(
    "mx-auto flex w-full max-w-4xl flex-col gap-8 rounded-[32px] border p-8 md:px-12 md:py-14",
    align === "center" ? "text-center md:text-center" : "text-left",
    variant === "dark"
      ? "border-white/10 bg-white/5 text-white shadow-lg shadow-emerald-500/5"
      : "border-slate-900/10 bg-white/90 text-slate-900 shadow-xl shadow-slate-900/5"
  );

  const eyebrowClass = cn(
    "inline-flex items-center justify-center gap-2 self-start rounded-full px-4 py-2 text-xs uppercase tracking-[0.4em] md:self-auto",
    variant === "dark"
      ? "border border-white/15 bg-white/10 text-emerald-200"
      : "border border-slate-900/10 bg-slate-900/5 text-emerald-600"
  );

  const descriptionClass = cn(
    "text-base md:text-lg",
    align === "center" ? "mx-auto max-w-2xl" : "max-w-2xl",
    variant === "dark" ? "text-slate-200/95" : "text-slate-700"
  );

  return (
    <div className={containerClass}>
      {eyebrow ? (
        <m.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className={eyebrowClass}
        >
          {eyebrow}
        </m.span>
      ) : null}

      <m.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={cn(
          "text-3xl font-semibold md:text-4xl",
          align === "center" ? "mx-auto max-w-3xl" : "max-w-3xl"
        )}
      >
        {title}
      </m.h2>

      {description ? (
        <m.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={descriptionClass}
        >
          {description}
        </m.p>
      ) : null}

      {children ? (
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className={align === "center" ? "mx-auto max-w-3xl" : undefined}
        >
          {children}
        </m.div>
      ) : null}
    </div>
  );
}
