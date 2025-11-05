import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { RightSidebar } from "@/components/app/RightSidebar";
import { getCurrentUser } from "@/lib/auth/get-current-user";

interface AppLayoutProps {
  children: ReactNode;
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const user = await getCurrentUser();

  // Redirect unauthenticated users to sign-in
  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="relative min-h-screen bg-[#0a0f1f] text-white">
      {/* Navbar blanche sticky en haut - à ajouter via NavbarApp */}
      <div className="mx-auto max-w-[1600px] px-6 py-10 md:px-10 md:py-14 xl:px-16">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr] lg:gap-8">
          <RightSidebar />

          <main className="min-w-0 max-w-5xl">
            <div className="space-y-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
