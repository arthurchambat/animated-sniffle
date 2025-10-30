'use client';

import { useEffect, useMemo, useState } from "react";
import { getHeaderHeight, headerHeightEvent } from "./useHeaderHeight";

interface SectionObserverOptions {
  rootMargin?: string;
  threshold?: number | number[];
}

interface SectionObserverResult {
  activeId: string | null;
  activeIndex: number;
}

const formatMargin = (top: number) => `-${Math.round(top)}px 0px 0px 0px`;

export function useSectionObserver(
  sectionIds: string[],
  { rootMargin, threshold = 0.6 }: SectionObserverOptions = {}
): SectionObserverResult {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const [dynamicMargin, setDynamicMargin] = useState<string>(() => formatMargin(getHeaderHeight()))
;

  const ids = useMemo(() => sectionIds.filter(Boolean), [sectionIds]);
  const resolvedRootMargin = rootMargin ?? dynamicMargin;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handler: EventListener = (event) => {
      const custom = event as CustomEvent<{ height?: number }>;
      if (typeof custom.detail?.height === "number") {
        setDynamicMargin(formatMargin(custom.detail.height));
        return;
      }
      setDynamicMargin(formatMargin(getHeaderHeight()));
    };

    setDynamicMargin(formatMargin(getHeaderHeight()));

    window.addEventListener(headerHeightEvent, handler);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener(headerHeightEvent, handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

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
      { rootMargin: resolvedRootMargin, threshold }
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [ids, resolvedRootMargin, threshold]);

  const activeIndex = activeId ? ids.indexOf(activeId) : -1;

  return {
    activeId,
    activeIndex: activeIndex >= 0 ? activeIndex : 0
  };
}
