'use client';

import { useCallback } from "react";
import { cn } from "@/lib/cn";
import { getHeaderHeight } from "@/lib/scroll/useHeaderHeight";

type DotTheme = "dark" | "light";

interface DotSection {
  id: string;
  label: string;
  theme?: DotTheme;
}

interface DotsNavProps {
  sections: DotSection[];
  activeId: string | null;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function DotsNav({ sections, activeId }: DotsNavProps) {
  const handleNavigate = useCallback((id: string) => {
    if (typeof window === "undefined") {
      return;
    }

    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    const scroller = document.querySelector('[data-page-scroller="true"]');
    const behavior = prefersReducedMotion() ? "auto" : "smooth";
    const headerOffset = getHeaderHeight();

    if (scroller instanceof HTMLElement) {
      const rect = target.getBoundingClientRect();
      const top = rect.top + scroller.scrollTop - headerOffset;
      scroller.scrollTo({ top, behavior });
      return;
    }

    target.scrollIntoView({ behavior, block: "start" });
  }, []);

  if (sections.length <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Navigation rapide"
      className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 lg:flex"
    >
      <ul className="flex flex-col items-center gap-4">
        {sections.map((section) => {
          const isActive = activeId === section.id;
          const isLight = section.theme === "light";
          return (
            <li key={section.id}>
              <button
                type="button"
                aria-label={section.label}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "pointer-events-auto h-3.5 w-3.5 rounded-full border transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                  isLight ? "focus-visible:outline-[#0a0f1f]" : "focus-visible:outline-white",
                  isActive
                    ? isLight
                      ? "border-[#0a0f1f] bg-[#0a0f1f]"
                      : "border-white bg-white"
                    : isLight
                      ? "border-[#0a0f1f66] bg-transparent hover:border-[#0a0f1f]"
                      : "border-white/40 bg-transparent hover:border-white/70"
                )}
                onClick={() => handleNavigate(section.id)}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
