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
    <div className="grid min-h-[calc(100dvh-var(--header-h,72px))] place-items-center bg-[#0a0f1f] px-6 py-10 text-white">
      <div className="flex w-full max-w-2xl flex-col gap-8">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.45em] text-white/70">
            FinanceBro
          </span>
          <h1 className="text-[clamp(28px,3vw,42px)] font-semibold leading-tight">
            Crée ton compte
          </h1>
          <p className="text-[clamp(15px,1.2vw,18px)] text-white/70">
            Rejoins les candidats qui se préparent aux meilleurs entretiens en finance.
          </p>
        </div>

        <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-8 backdrop-blur-sm">
          <SignUpWizard />
        </div>
      </div>
    </div>
  );
}
