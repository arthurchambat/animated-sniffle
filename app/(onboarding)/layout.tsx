import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default async function OnboardingLayout({ children }: OnboardingLayoutProps) {
  const user = await getCurrentUser();

  // Redirect unauthenticated users to sign-in
  if (!user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="relative min-h-screen bg-[#0a0f1f] text-white">
      <div className="mx-auto max-w-4xl px-6 py-10 md:px-10 md:py-14">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
            FinanceBro
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Quelques informations pour personnaliser ton expérience
          </p>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
