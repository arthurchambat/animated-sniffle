import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { SignUpWizard } from "@/components/auth/SignUpWizard";

export const metadata: Metadata = {
  title: "Inscription - FinanceBro",
  description: "Crée ton compte FinanceBro pour commencer tes simulations d'entretiens."
};

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-24 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-px bg-gradient-to-b from-emerald-300/0 via-emerald-400/40 to-emerald-300/0 md:block" />
      
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-12 px-4 md:px-6">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.45em] text-emerald-200">
            FinanceBro
          </span>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Crée ton compte
          </h1>
          <p className="text-sm text-slate-300/85 md:text-base">
            Rejoins les candidats qui se préparent aux meilleurs entretiens en finance.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
          <SignUpWizard />
        </div>
      </div>
    </div>
  );
}
