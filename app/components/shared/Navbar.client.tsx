"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogIn, Menu, X } from "lucide-react";
import { FinanceLogoMark } from "@/components/branding/FinanceLogoMark";
import { cn } from "@/lib/cn";
import { getHeaderHeight } from "@/lib/scroll/useHeaderHeight";

export interface NavbarClientUser {
  id: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  plan?: string | null;
}

interface NavbarClientProps {
  mode: "public" | "app";
  user: NavbarClientUser | null;
}

const PUBLIC_LINKS = [
  { href: "#produit", label: "Produit" },
  { href: "#equipe", label: "Équipe" },
  { href: "#pricing", label: "Pricing" },
  { href: "#contact", label: "Contact" }
] as const;

const APP_LINKS = [
  { href: "/home", label: "Accueil" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/feedback", label: "Feedbacks" },
  { href: "/pricing", label: "Pricing" },
  { href: "/team", label: "Équipe" }
] as const;

const resolveScrollBehavior = () => {
  if (typeof window === "undefined") {
    return "auto" as const;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? ("auto" as const) : ("smooth" as const);
};

export function NavbarClient({ mode, user }: NavbarClientProps) {
  const [isScrolled, setScrolled] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      if (href.startsWith("#")) {
        event.preventDefault();
        if (typeof window === "undefined") {
          return;
        }
        const targetId = href.slice(1);
        const section = document.getElementById(targetId);
        if (section) {
          const scroller = document.querySelector('[data-page-scroller="true"]');
          const behavior = resolveScrollBehavior();
          const headerOffset = getHeaderHeight();

          if (scroller instanceof HTMLElement) {
            const top = section.getBoundingClientRect().top + scroller.scrollTop - headerOffset;
            scroller.scrollTo({ top, behavior });
          } else {
            section.scrollIntoView({ behavior, block: "start" });
          }
        }
        return;
      }

      if (href === pathname) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      event.preventDefault();
      router.push(href);
    },
    [pathname, router]
  );

  const nameInitials = user
    ? [user.firstName, user.lastName]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.charAt(0).toUpperCase())
        .join("")
        .slice(0, 2)
    : null;

  const initials = user
    ? nameInitials && nameInitials.length > 0
      ? nameInitials
      : (user.email ?? "F")[0]?.toUpperCase() ?? "F"
    : null;

  const ctaHref = user ? "/home" : "/auth/sign-in";
  const ctaLabel = user ? "Accéder à l'app" : "Se connecter";

  const links = mode === "public" ? PUBLIC_LINKS : APP_LINKS;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border px-5 py-3 transition-all duration-300",
          "border-white/15 bg-[#0a0f1f]/70 backdrop-blur-xl",
          isScrolled && "border-white/20 bg-[#0a0f1f]/85 shadow-[0_18px_40px_rgba(10,15,31,0.35)]"
        )}
        role="navigation"
        aria-label="Navigation principale"
      >
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-white">
          <FinanceLogoMark />
          <span className="hidden sm:inline text-base">FinanceBro</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-white lg:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={(event) => handleLinkClick(event, href)}
              className={cn(
                "relative py-1 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:opacity-100",
                pathname === href && !href.startsWith("#") && "opacity-100 font-semibold"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            onClick={(event) => handleLinkClick(event, ctaHref)}
            className="inline-flex items-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#0a0f1f] transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <span>{ctaLabel}</span>
            {!user ? <LogIn className="ml-2 h-4 w-4" aria-hidden="true" /> : null}
          </Link>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          {mode === "app" && user ? (
            <Link
              href="/home"
              onClick={(event) => handleLinkClick(event, "/home")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white"
              aria-label="Accéder à l'accueil"
            >
              {initials}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="mx-auto mt-3 w-full max-w-6xl rounded-3xl border border-white/20 bg-[#0a0f1f]/90 p-6 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold text-white">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={(event) => {
                  handleLinkClick(event, href);
                  setMenuOpen(false);
                }}
                className="rounded-full px-4 py-2 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              >
                {label}
              </Link>
            ))}
            <Link
              href={ctaHref}
              onClick={(event) => {
                handleLinkClick(event, ctaHref);
                setMenuOpen(false);
              }}
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#0a0f1f] transition hover:bg-white/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <span>{ctaLabel}</span>
              {!user ? <LogIn className="ml-2 h-4 w-4" aria-hidden="true" /> : null}
            </Link>
            {mode === "app" && user ? (
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-sm font-semibold text-white">
                  {initials}
                </div>
                <div className="text-xs text-white/70">
                  <p className="font-semibold text-white">{user.firstName ?? "Membre"}</p>
                  <p className="uppercase tracking-wide text-white/70">{user.plan ?? "free"}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
