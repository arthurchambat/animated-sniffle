'use client';

import { useEffect, useMemo, useState } from "react";

interface SectionObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

interface SectionObserverResult {
  activeId: string | null;
  activeIndex: number;
}

export function useSectionObserver(
  sectionIds: string[],
  { rootMargin = "0px 0px -50% 0px", threshold = [0, 0.25, 0.5, 0.75, 1] }: SectionObserverOptions = {}
): SectionObserverResult {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);

  const ids = useMemo(() => sectionIds.filter(Boolean), [sectionIds]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    if (!ids.length || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((element): element is Element => Boolean(element));

    if (!elements.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (!visibleEntries.length) {
          return;
        }

        const mostVisible = visibleEntries.reduce((prev, current) =>
          current.intersectionRatio > prev.intersectionRatio ? current : prev
        );

        const currentId = mostVisible.target.id;
        setActiveId((prevId) => (prevId === currentId ? prevId : currentId));
      },
      { rootMargin, threshold }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [ids, rootMargin, threshold]);

  const activeIndex = activeId ? ids.indexOf(activeId) : -1;

  return {
    activeId,
    activeIndex: activeIndex >= 0 ? activeIndex : 0
  };
}
