import type { ReactNode } from "react";
import { NavbarPublic, NAV_SECTIONS } from "@/components/marketing/NavbarPublic";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0f1f] text-white">
      <NavbarPublic sections={NAV_SECTIONS} />
      {children}
    </div>
  );
}
