import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { AuthTabs } from "@/components/auth/AuthTabs";

export const metadata: Metadata = {
  title: "Accès",
  description:
    "Connecte-toi ou crée un compte FinanceBro pour lancer tes mock interviews IA et suivre tes feedbacks."
};

interface AuthPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }

  const resolved = searchParams instanceof Promise ? await searchParams : searchParams ?? {};

  const tabParam = typeof resolved?.tab === "string"
    ? resolved.tab
    : Array.isArray(resolved?.tab)
      ? resolved?.tab.at(0)
      : undefined;
  const initialTab = tabParam === "sign-up" ? "sign-up" : "sign-in";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 py-24 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 hidden w-[1px] bg-gradient-to-b from-emerald-300/0 via-emerald-400/40 to-emerald-300/0 md:block" />
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4 md:px-6">
        <div className="space-y-4 text-center">
          <span className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.45em] text-emerald-200">
            FinanceBro
          </span>
          <h1 className="text-3xl font-semibold md:text-4xl">
            Accède à ton coach IA pour les entretiens finance
          </h1>
          <p className="text-sm text-slate-300/85 md:text-base">
            Connecte-toi ou crée ton espace pour lancer des simulations vidéo, recevoir des feedbacks détaillés et suivre ta progression.
          </p>
        </div>

        <AuthTabs initialTab={initialTab === "sign-up" ? "sign-up" : "sign-in"} />
      </div>
    </div>
  );
}
