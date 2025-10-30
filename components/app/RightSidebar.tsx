'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { cn } from "@/lib/cn";
import { APP_LINKS } from "@/lib/nav/appLinks";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function RightSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createSupabaseBrowserClient();

  // Sidebar is expanded if not collapsed OR if hovering
  const isExpanded = !collapsed || isHovering;

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <nav aria-label="Navigation principale" className="space-y-2">
      {APP_LINKS.map((link) => {
        const isActive =
          pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-emerald-500/10 text-emerald-200 shadow-sm border border-emerald-400/20"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
            )}
            title={!isExpanded ? link.label : undefined}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {isExpanded && <span className="truncate">{link.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      window.location.href = "/";
    } catch (error) {
      console.error("[FinanceBro] Logout failed", error);
      toast.error("Impossible de se déconnecter. Réessaie.");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Desktop Sidebar - Left, Collapsable with hover expand */}
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 sticky top-6 h-[calc(100vh-3rem)] border-r border-white/10 bg-slate-950/50 backdrop-blur-sm transition-all duration-300 ease-in-out rounded-xl overflow-hidden",
          isExpanded ? "w-64" : "w-20"
        )}
        aria-label="Barre latérale de navigation"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex h-full flex-col p-4">
          {/* Header with collapse toggle */}
          <div className={cn("flex items-center mb-6", isExpanded ? "justify-between" : "justify-center")}>
            {isExpanded && (
              <h2 className="text-lg font-semibold text-slate-100 truncate">FinanceBro</h2>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors",
                !isExpanded && "mx-auto"
              )}
              aria-label={collapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <SidebarContent />
          </div>

          <div className="mt-auto pt-4">
            <div className="border-t border-white/10 pt-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "w-full justify-center gap-2 text-slate-300 hover:bg-white/5 hover:text-emerald-200",
                  !isExpanded && "px-2"
                )}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {isExpanded && <span>{isLoggingOut ? "Déconnexion..." : "Se déconnecter"}</span>}
              </Button>
            </div>

            {!isExpanded && (
              <div className="mt-4 flex justify-center">
                <div className="h-1 w-6 rounded-full bg-slate-700" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-6 left-6 z-50">
        <Button
          variant="secondary"
          size="sm"
          className="h-12 w-12 p-0 rounded-xl shadow-lg"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="lg:hidden fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-white/10 bg-slate-950 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-slate-100">FinanceBro</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
            </div>
            <div className="border-t border-white/10 p-6">
              <Button
                type="button"
                variant="secondary"
                className="w-full justify-center gap-2"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
