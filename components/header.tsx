"use client";

import { AnimatePresence, m } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/cn";

const navItems = [
  { href: "/pricing", label: "Pricing" },
  { href: "/team", label: "Notre équipe" },
  { href: "/contact", label: "Nous contacter" },
  { href: "/dashboard", label: "Mon tableau de bord" },
  { href: "/auth/login", label: "Se connecter" }
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <m.header
      initial={false}
      animate={{
        backgroundColor: scrolled ? "rgba(8, 24, 39, 0.65)" : "rgba(8, 24, 39, 0.4)",
        boxShadow: scrolled
          ? "0 18px 40px rgba(8, 24, 39, 0.35), 0 25px 55px rgba(0, 135, 90, 0.22)"
          : "0 4px 25px rgba(0, 0, 0, 0.15)",
        borderColor: scrolled ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.06)"
      }}
      transition={{ type: "spring", stiffness: 110, damping: 16 }}
      className={cn(
        "fixed left-1/2 top-5 z-50 flex w-[min(960px,92vw)] -translate-x-1/2 items-center justify-between rounded-full border px-5 py-3 backdrop-blur-xl"
      )}
    >
      <Link href="/" className="flex items-center gap-3">
        <span className="finance-gradient flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white shadow-lg shadow-emerald-500/20">
          FB
        </span>
        <span className="text-sm font-medium text-slate-200">
          FinanceBro
          <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
            beta
          </span>
        </span>
      </Link>

      <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-200 md:flex">
        <Link href="/" className={cn("transition-colors hover:text-emerald-300", pathname === "/" && "text-emerald-300")}>
          Accueil
        </Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-emerald-300",
              pathname.startsWith(item.href) && "text-emerald-300"
            )}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/pre"
          className="rounded-full bg-emerald-500/90 px-4 py-2 text-xs uppercase tracking-wide text-slate-900 transition hover:bg-emerald-400"
        >
          Préparez mes entretiens
        </Link>
      </nav>

      <div className="flex items-center gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:border-white/20 hover:bg-white/10"
          aria-label="Ouvrir le menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <m.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-16 z-40 w-full rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col gap-4 text-sm font-semibold text-slate-100">
              <Link href="/" className="transition hover:text-emerald-300">
                Accueil
              </Link>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-emerald-300"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/pre"
                className="rounded-full bg-emerald-500/90 px-4 py-2 text-center text-xs uppercase tracking-wide text-slate-900 transition hover:bg-emerald-400"
              >
                Préparez mes entretiens
              </Link>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </m.header>
  );
}
