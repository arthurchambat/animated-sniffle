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
                  isActive
                    ? "border-emerald-400/60 bg-emerald-400/10 text-emerald-200 shadow-lg shadow-emerald-500/20"
                    : isDarkTheme
                      ? "border-white/10 bg-white/5 text-slate-400 hover:border-emerald-300/40 hover:text-emerald-200"
                      : "border-slate-900/10 bg-white/60 text-slate-600 hover:border-emerald-500/40 hover:text-emerald-600"
                )}
                onClick={() => {
                  const target = document.getElementById(chapter.id);
                  target?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <span>{chapter.label}</span>
                <span
                  className={cn(
                    "ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[10px]",
                    isActive
                      ? "border-emerald-400/60 bg-emerald-400/20 text-emerald-100"
                      : isDarkTheme
                        ? "border-white/10 bg-white/10 text-slate-400"
                        : "border-slate-900/10 bg-slate-100 text-slate-600"
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
