'use client';

import { cn } from "@/lib/cn";
import type { NavbarTheme } from "./NavbarPublic";

interface Chapter {
  id: string;
  label: string;
  theme?: NavbarTheme;
}

interface ChaptersRailProps {
  chapters: Chapter[];
  activeIndex: number;
}

export function ChaptersRail({ chapters, activeIndex }: ChaptersRailProps) {
  return (
    <aside className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col gap-3 text-xs font-semibold uppercase tracking-[0.35em]">
        {chapters.map((chapter, index) => {
          const isActive = index === activeIndex;
          const isDarkTheme = chapter.theme === "dark" || !chapter.theme;

          return (
            <li key={chapter.id}>
              <button
                type="button"
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "pointer-events-auto flex min-w-40 items-center justify-between rounded-full border px-3 py-2 transition-all duration-200",
                  isDarkTheme
                    ? cn(
                        "text-white/70 hover:text-white",
                        isActive
                          ? "border-white/40 bg-white/15 text-white shadow-[0_10px_24px_rgba(10,15,31,0.35)]"
                          : "border-white/20 bg-white/10"
                      )
                    : cn(
                        "text-[#0a0f1f]/70 hover:text-[#0a0f1f]",
                        isActive
                          ? "border-[#0a0f1f] bg-[#0a0f1f]/10 text-[#0a0f1f] shadow-[0_10px_24px_rgba(10,15,31,0.15)]"
                          : "border-[#0a0f1f1a] bg-white/80"
                      )
                )}
                onClick={() => {
                  const target = document.getElementById(chapter.id);
                  const prefersReduced =
                    typeof window !== "undefined" &&
                    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                  target?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
                }}
              >
                <span>{chapter.label}</span>
                <span
                  className={cn(
                    "ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                    isDarkTheme
                      ? isActive
                        ? "border-white/40 bg-white text-[#0a0f1f]"
                        : "border-white/20 bg-white/10 text-white/80"
                      : isActive
                        ? "border-[#0a0f1f] bg-[#0a0f1f] text-white"
                        : "border-[#0a0f1f33] bg-white text-[#0a0f1f]"
                  )}
                >
                  {index + 1}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
