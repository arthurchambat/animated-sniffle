"use client";

import { useEffect, useRef, useState } from "react";

const FALLBACKS = [
  { width: 1536, value: 88 },
  { width: 1280, value: 80 },
  { width: 768, value: 72 },
  { width: 0, value: 64 }
];

const HEADER_EVENT = "financebro:header-height";

const resolveFallback = (width: number) => {
  const match = FALLBACKS.find((item) => width >= item.width);
  return match ? match.value : 72;
};

const dispatchHeaderEvent = (value: number) => {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(() => {
      window.dispatchEvent(new CustomEvent(HEADER_EVENT, { detail: { height: value } }));
    });
    return;
  }

  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(HEADER_EVENT, { detail: { height: value } }));
  }, 0);
};

const setHeaderVariable = (value: number) => {
  if (typeof document === "undefined") {
    return;
  }

  const pxValue = `${Math.round(value)}px`;
  const root = document.documentElement;
  root.style.setProperty("--header-h", pxValue);

  dispatchHeaderEvent(value);
};

const readHeaderVariable = () => {
  if (typeof window === "undefined") {
    return 72;
  }
  const root = document.documentElement;
  const inline = root.style.getPropertyValue("--header-h");
  const computed = inline || getComputedStyle(root).getPropertyValue("--header-h");
  const parsed = Number.parseFloat(computed);
  return Number.isFinite(parsed) ? parsed : 72;
};

export function useHeaderHeight() {
  const elementRef = useRef<HTMLElement | null>(null);
  const [height, setHeight] = useState<number>(() => {
    if (typeof window === "undefined") {
      return 72;
    }
    return resolveFallback(window.innerWidth);
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncFallback = () => {
      const fallbackValue = resolveFallback(window.innerWidth);
      setHeight((prev) => {
        if (Math.abs(prev - fallbackValue) > 1) {
          setHeaderVariable(fallbackValue);
          return fallbackValue;
        }
        setHeaderVariable(prev);
        return prev;
      });
    };

    syncFallback();

    const handleResize = () => {
      const measured = elementRef.current?.getBoundingClientRect().height;
      if (measured && measured > 0) {
        setHeight((prev) => {
          if (Math.abs(prev - measured) > 1) {
            setHeaderVariable(measured);
            return measured;
          }
          setHeaderVariable(prev);
          return prev;
        });
        return;
      }

      syncFallback();
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!elementRef.current || typeof window === "undefined") {
      setHeaderVariable(height);
      return;
    }

    const element = elementRef.current;

    const update = () => {
      const measured = element.getBoundingClientRect().height;
      const fallback = resolveFallback(window.innerWidth);
      const current = measured || fallback;
      setHeight((prev) => {
        if (Math.abs(prev - current) > 1) {
          setHeaderVariable(current);
          return current;
        }
        setHeaderVariable(prev);
        return prev;
      });
    };

    update();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => update());
      observer.observe(element);
      return () => observer.disconnect();
    }

    const interval = window.setInterval(update, 400);
    return () => window.clearInterval(interval);
  }, [height]);

  useEffect(() => {
    const resolved = readHeaderVariable();
    if (Math.abs(resolved - height) > 1) {
      setHeight(resolved);
    }
  }, [height]);

  return { ref: elementRef, height } as const;
}

export const headerHeightEvent = HEADER_EVENT;
export const getHeaderHeight = readHeaderVariable;
