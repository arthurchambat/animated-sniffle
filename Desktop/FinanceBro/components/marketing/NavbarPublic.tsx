'use client';

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

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
  dark: "text-slate-100 border-white/10 bg-slate-950/50",
  light: "text-slate-900 border-slate-950/10 bg-white/70"
};

const CTA_CLASSES: Record<NavbarTheme, string> = {
  dark: "bg-emerald-400 text-slate-950 hover:bg-emerald-300 focus-visible:ring-emerald-200",
  light: "bg-slate-900 text-emerald-200 hover:bg-slate-800 focus-visible:ring-slate-900/80"
};

type ChapterChangeDetail = {
  id?: string;
  theme?: NavbarTheme;
};

export function NavbarPublic({ sections }: NavbarPublicProps) {
  const items = sections ?? NAV_SECTIONS;
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<NavbarTheme>("dark");
  const [isScrolled, setScrolled] = useState(false);
  const [isVisible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [active, setActive] = useState<string>(items[0]?.id ?? "hero");

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

    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setMenuOpen(false);
  }, []);

  const navClassName = useMemo(
    () =>
      cn(
        "fixed left-1/2 z-[60] flex w-[min(960px,92vw)] -translate-x-1/2 items-center justify-between rounded-full border px-5 py-3 backdrop-blur-xl",
        "transition-all duration-300 ease-in-out",
        THEME_CLASSES[theme],
        isScrolled ? "shadow-2xl shadow-emerald-500/10" : "shadow-lg shadow-black/10",
        isVisible ? "top-6 translate-y-0 opacity-100" : "-top-24 -translate-y-full opacity-0"
      ),
    [theme, isScrolled, isVisible]
  );

  const ctaClassName = cn(
    "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition focus-visible:outline-none focus-visible:ring-2",
    CTA_CLASSES[theme]
  );

  return (
    <header>
      <div className={navClassName}>
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold">
          <span className="finance-gradient flex h-9 w-9 items-center justify-center rounded-lg text-base text-white shadow-lg shadow-emerald-500/20">
            FB
          </span>
          <span>FinanceBro</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => handleNavigate(event, item.id)}
              className={cn(
                "transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:text-emerald-300",
                active === item.id && "text-emerald-300"
              )}
              aria-current={active === item.id ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth/sign-in" className={ctaClassName}>
            Get Started
          </Link>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2",
              theme === "dark"
                ? "border-white/15 bg-white/10 text-slate-100 focus-visible:ring-emerald-200"
                : "border-slate-900/10 bg-white text-slate-900 focus-visible:ring-slate-900/30"
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
            theme === "dark"
              ? "border-white/10 bg-slate-950/90 text-slate-100"
              : "border-slate-900/10 bg-white/95 text-slate-900"
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
                    ? theme === "dark"
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-slate-900/5 text-slate-900"
                    : theme === "dark"
                      ? "hover:bg-white/5"
                      : "hover:bg-slate-900/5"
                )}
                aria-current={active === item.id ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/auth/sign-in" className={ctaClassName}>
              Get Started
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
