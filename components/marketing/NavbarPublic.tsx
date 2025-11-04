'use client';

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LogIn, Menu, X } from "lucide-react";
import { FinanceLogoMark } from "@/components/branding/FinanceLogoMark";
import { cn } from "@/lib/cn";
import { getHeaderHeight, useHeaderHeight } from "@/lib/scroll/useHeaderHeight";

export type NavbarTheme = "dark" | "light";

export interface NavSection {
  id: string;
  label: string;
}

export const NAV_SECTIONS: NavSection[] = [
  { id: "hero", label: "Accueil" },
  { id: "story", label: "Comment ça marche" },
  { id: "value", label: "Valeur" },
  { id: "team", label: "Équipe" },
  { id: "pricing", label: "Pricing" },
  { id: "contact", label: "Contact" },
  { id: "cta", label: "Commencer" }
];

interface NavbarPublicProps {
  sections?: NavSection[];
}

const THEME_CLASSES: Record<NavbarTheme, string> = {
  dark: "text-white border-white/20 bg-[#0a0f1f]/80",
  light: "text-[#0a0f1f] border-[#0a0f1f1a] bg-white/85"
};

const CTA_CLASSES: Record<NavbarTheme, string> = {
  dark: "bg-white text-[#0a0f1f] hover:bg-white/85 focus-visible:ring-white/50",
  light: "bg-[#0a0f1f] text-white hover:bg-[#0a0f1f]/90 focus-visible:ring-[#0a0f1f]/40"
};

type ChapterChangeDetail = {
  id?: string;
  theme?: NavbarTheme;
};

export function NavbarPublic({ sections }: NavbarPublicProps) {
  const { ref: headerRef } = useHeaderHeight();
  const items = sections ?? NAV_SECTIONS;
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<NavbarTheme>("dark");
  const [isScrolled, setScrolled] = useState(false);
  const [isVisible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [active, setActive] = useState<string>(items[0]?.id ?? "hero");
  const getScrollBehavior = () => {
    if (typeof window === "undefined") {
      return "auto" as const;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? ("auto" as const) : ("smooth" as const);
  };


  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if scrolled past threshold
      setScrolled(currentScrollY > 16);
      
      // Show/hide navbar based on scroll direction
      if (currentScrollY < 100) {
        // Always show at top of page
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current + 10) {
        // Scrolling down - hide navbar (with 10px threshold to avoid jitter)
        setVisible(false);
        setMenuOpen(false); // Close menu when hiding
      } else if (currentScrollY < lastScrollY.current - 10) {
        // Scrolling up - show navbar
        setVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };
    
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const listener = (event: Event) => {
      const customEvent = event as CustomEvent<ChapterChangeDetail>;
      const detail = customEvent.detail ?? {};
      if (detail.id) {
        setActive(detail.id);
      }
      if (detail.theme) {
        setTheme(detail.theme);
      }
    };

    window.addEventListener("chapter-change", listener as EventListener);
    return () => window.removeEventListener("chapter-change", listener as EventListener);
  }, []);

  useEffect(() => {
    setActive((prev) => (items.some((item) => item.id === prev) ? prev : items[0]?.id ?? "hero"));
  }, [items]);

  const handleNavigate = useCallback((event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();

    if (typeof window === "undefined") {
      return;
    }

    const target = document.getElementById(id);
    const behavior = getScrollBehavior();

    if (target) {
      const scroller = document.querySelector('[data-page-scroller="true"]');
      const headerOffset = getHeaderHeight();

      if (scroller instanceof HTMLElement) {
        const top = target.getBoundingClientRect().top + scroller.scrollTop - headerOffset;
        scroller.scrollTo({ top, behavior });
      } else {
        target.scrollIntoView({ behavior, block: "start" });
      }
    }

    setMenuOpen(false);
  }, []);

  const navClassName = useMemo(
    () =>
      cn(
        "fixed left-1/2 z-[60] flex w-[min(960px,92vw)] -translate-x-1/2 items-center justify-between rounded-full border px-5 py-3 backdrop-blur-xl",
        "transition-all duration-300 ease-in-out",
        // NAVBAR TOUJOURS BLANCHE - ne change jamais de thème
        "bg-white text-[#0a0f1f] border-[#0a0f1f]/10",
        isScrolled
          ? "shadow-[0_18px_40px_rgba(10,15,31,0.35)]"
          : "shadow-[0_12px_24px_rgba(10,15,31,0.18)]",
        isVisible ? "top-6 translate-y-0 opacity-100" : "-top-24 -translate-y-full opacity-0"
      ),
    [isScrolled, isVisible]
  );

  // CTA toujours avec style light (fond sombre sur navbar blanche)
  const ctaClassName = cn(
    "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2",
    "bg-[#0a0f1f] text-white hover:bg-[#0a0f1f]/90 focus-visible:ring-[#0a0f1f]/40"
  );

  return (
    <header>
      <div ref={headerRef} className={navClassName}>
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
          <FinanceLogoMark />
          <span className="text-base">FinanceBro</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => handleNavigate(event, item.id)}
              className={cn(
                "opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100",
                active === item.id && "opacity-100 font-semibold"
              )}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth/sign-in" className={ctaClassName}>
            <span>Se connecter</span>
            <LogIn className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2",
              // Bouton menu toujours style light (navbar blanche)
              "border-[#0a0f1f]/10 bg-[#0a0f1f]/5 text-[#0a0f1f] focus-visible:ring-[#0a0f1f]/20"
            )}
            aria-expanded={isMenuOpen}
            aria-controls="navbar-public-menu"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div
          id="navbar-public-menu"
          className={cn(
            "fixed inset-x-4 top-[88px] z-[55] rounded-3xl border p-6 shadow-2xl backdrop-blur-xl lg:hidden",
            // Menu mobile toujours blanc
            "border-[#0a0f1f]/10 bg-white/95 text-[#0a0f1f]"
          )}
        >
          <div className="flex flex-col gap-4 text-sm font-semibold">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`#${item.id}`}
                onClick={(event) => handleNavigate(event, item.id)}
                className={cn(
                  "rounded-full px-4 py-2 transition",
                  active === item.id
                    ? "bg-[#0a0f1f]/10 text-[#0a0f1f]"
                    : "hover:bg-[#0a0f1f]/10"
                )}
                aria-current={active === item.id ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/auth/sign-in" className={ctaClassName}>
              <span>Se connecter</span>
              <LogIn className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
