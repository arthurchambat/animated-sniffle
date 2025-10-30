"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

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
        const targetId = href.slice(1);
        const section = document.getElementById(targetId);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const ctaLabel = user ? "Accéder à l'app" : "Get Started";

  const links = mode === "public" ? PUBLIC_LINKS : APP_LINKS;

  return (
    <header className="sticky top-0 z-50 w-full">
      <div
        className={cn(
          "mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border px-5 py-3 transition-all duration-300",
          "border-white/10 bg-slate-900/60 backdrop-blur-xl",
          isScrolled && "border-white/15 bg-slate-950/85 shadow-lg shadow-emerald-500/15"
        )}
        role="navigation"
        aria-label="Navigation principale"
      >
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-slate-100">
          <span className="finance-gradient flex h-9 w-9 items-center justify-center rounded-lg text-base text-white shadow-lg shadow-emerald-500/20">
            FB
          </span>
          <span className="hidden sm:inline">FinanceBro</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 lg:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={(event) => handleLinkClick(event, href)}
              className={cn(
                "relative py-1 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:text-emerald-300",
                pathname === href && !href.startsWith("#") && "text-emerald-300"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href={ctaHref}
            onClick={(event) => handleLinkClick(event, ctaHref)}
            className="inline-flex items-center rounded-full bg-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
          >
            {ctaLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-3 lg:hidden">
          {mode === "app" && user ? (
            <Link
              href="/home"
              onClick={(event) => handleLinkClick(event, "/home")}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-emerald-200"
              aria-label="Accéder à l'accueil"
            >
              {initials}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-100 hover:border-white/20 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="mx-auto mt-3 w-full max-w-6xl rounded-3xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl lg:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold text-slate-200">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={(event) => {
                  handleLinkClick(event, href);
                  setMenuOpen(false);
                }}
                className="rounded-full px-4 py-2 transition hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
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
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-3 text-xs uppercase tracking-wide text-slate-950 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200"
            >
              {ctaLabel}
            </Link>
            {mode === "app" && user ? (
              <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-semibold text-emerald-100">
                  {initials}
                </div>
                <div className="text-xs text-slate-300">
                  <p className="font-semibold text-slate-100">{user.firstName ?? "Membre"}</p>
                  <p className="uppercase tracking-wide text-emerald-200/80">{user.plan ?? "free"}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
