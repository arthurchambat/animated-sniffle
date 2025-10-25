import type { ReactNode } from "react";
import { NavbarPublic, NAV_SECTIONS } from "@/components/marketing/NavbarPublic";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_55%)]" />
      <NavbarPublic sections={NAV_SECTIONS} />
      {children}
    </div>
  );
}
