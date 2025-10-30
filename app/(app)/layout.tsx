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
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(79,216,167,0.25),_transparent_60%)]" />
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
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
