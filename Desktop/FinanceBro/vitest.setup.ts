import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, src, ...rest }: any) => {
    const { fill, priority, loader, ...imgProps } = rest;
    return React.createElement("img", { alt, src, ...imgProps });
  }
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: React.ComponentProps<"a"> & { href: string }) =>
    React.createElement("a", { href, ...rest }, children)
}));

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof window !== "undefined" && !("ResizeObserver" in window)) {
  // @ts-expect-error - assigning to window for tests
  window.ResizeObserver = ResizeObserverMock;
}

if (typeof window !== "undefined" && !window.matchMedia) {
  // @ts-expect-error - assign mock matchMedia
  window.matchMedia = (query: string) => {
    const listeners = new Set<(event: MediaQueryListEvent) => void>();
    return {
      media: query,
      matches: false,
      addEventListener: (_: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.add(listener);
      },
      removeEventListener: (_: "change", listener: (event: MediaQueryListEvent) => void) => {
        listeners.delete(listener);
      },
      addListener: (listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      dispatchEvent: () => false,
      onchange: null
    };
  };
}

type ObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

class IntersectionObserverMock {
  static instances: IntersectionObserverMock[] = [];
  private callback: ObserverCallback;
  private options?: IntersectionObserverInit;
  private elements = new Set<Element>();

  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    IntersectionObserverMock.instances.push(this);
  }

  observe(element: Element) {
    this.elements.add(element);
  }

  unobserve(element: Element) {
    this.elements.delete(element);
  }

  disconnect() {
    this.elements.clear();
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  trigger(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  // @ts-expect-error - assigning to window for tests
  window.IntersectionObserver = IntersectionObserverMock;
}

// Expose for tests
// @ts-expect-error - augment global for test helpers
globalThis.IntersectionObserverMock = IntersectionObserverMock;
