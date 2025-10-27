'use client';

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const signInSchema = z.object({
  email: z.string().min(1, "Email ou nom d'utilisateur requis."),
  password: z.string().min(1, "Mot de passe requis.")
});

type SignInValues = z.infer<typeof signInSchema>;

const inputClass =
  "w-full rounded-[var(--radius)] border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values: SignInValues) => {
    setLoading(true);
    try {
      console.log("🔐 Tentative de connexion avec:", values.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password
      });
      
      console.log("📊 Résultat connexion:", { data, error });
      
      if (error) {
        throw error;
      }

      console.log("✅ Connexion réussie, redirection vers /dashboard");
      toast.success("Connexion réussie. Redirection en cours...");
      
      // Wait for session to be properly set in cookies
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verify session is set
      const { data: sessionData } = await supabase.auth.getSession();
      console.log("🔑 Session après connexion:", sessionData);
      
      // Force a full page reload to let middleware handle the redirect
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      const message =
        error instanceof Error ? error.message : "Impossible de se connecter. Réessayez.";
      toast.error(message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthLoading(true);
    try {
      const next = searchParams?.get("from") ?? "/dashboard";
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl
        }
      });
      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible de démarrer la connexion Google.";
      toast.error(message);
      setOauthLoading(false);
    }
  };

  return (
    <div className="grid gap-8">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="signin-email">
            Email ou nom d'utilisateur
          </label>
          <input
            id="signin-email"
            type="text"
            autoComplete="email"
            placeholder="prenom@banque.com"
            className={cn(inputClass, errors.email && "border-rose-400/70 focus:ring-rose-200")}
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-rose-300">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <label className="text-sm font-medium text-slate-200" htmlFor="signin-password">
            Mot de passe
          </label>
          <input
            id="signin-password"
            type="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            className={cn(inputClass, errors.password && "border-rose-400/70 focus:ring-rose-200")}
            {...register("password")}
          />
          {errors.password ? (
            <p className="text-xs text-rose-300">{errors.password.message}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" disabled={loading || oauthLoading}>
          {loading ? "Connexion..." : "Se connecter"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-slate-950 px-2 text-slate-400">Ou continuer avec</span>
        </div>
      </div>

      <div className="grid gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex items-center justify-center gap-2"
          onClick={handleGoogleSignIn}
          disabled={loading || oauthLoading}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 533.5 544.3"
            aria-hidden="true"
            focusable="false"
          >
            <path
              fill="#4285f4"
              d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.5h147.3c-6.4 34.7-25.8 64.1-55 83.6v69.4h88.7c52 47.9 82 118.5 82 197.2z"
            />
            <path
              fill="#34a853"
              d="M272 544.3c73.7 0 135.4-24.3 180.5-66.1l-88.7-69.4c-24.7 16.6-56.2 26.3-91.8 26.3-70.6 0-130.5-47.6-151.8-111.5H27.5v69.9C72.9 486.5 167.1 544.3 272 544.3z"
            />
            <path
              fill="#fbbc04"
              d="M120.2 323.6c-8.7-25.8-8.7-53.7 0-79.5v-69.9H27.5c-38.1 67.9-38.1 151.7 0 219.6z"
            />
            <path
              fill="#ea4335"
              d="M272 214.8c38.6-.6 75.8 14.5 103.4 41.5l77.1-77.1C394.5 94.7 332.7 65.5 272 66.1 167.1 66.1 72.9 123.9 27.5 206.9l92.7 69.9c21.3-63.9 81.2-111.7 151.8-111.7z"
            />
          </svg>
          Continuer avec Google
        </Button>
      </div>

      <p className="text-center text-sm text-slate-300/80">
        Pas encore de compte ?{" "}
        <Link href="/auth/sign-up" className="font-semibold text-emerald-200 hover:text-emerald-100 underline">
          Créer un nouveau compte
        </Link>
      </p>
    </div>
  );
}
