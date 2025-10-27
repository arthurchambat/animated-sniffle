'use client';

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthApiError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StepOneIdentity, type StepOneValues } from "@/components/auth/StepOneIdentity";

const MIN_PASSWORD_LENGTH = 8;

const isAtLeast16 = (dob: string) => {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }
  const today = new Date();
  const sixteenYearsAgo = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
  return birthDate <= sixteenYearsAgo;
};

const signUpSchema = z.object({
  email: z.string().email("Adresse email invalide."),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Mot de passe trop court (min ${MIN_PASSWORD_LENGTH} caractères).`),
  firstName: z
    .string()
    .min(1, "Prénom requis.")
    .max(80, "Prénom trop long."),
  lastName: z
    .string()
    .min(1, "Nom requis.")
    .max(80, "Nom trop long."),
  dob: z.string().refine((value) => isAtLeast16(value), "Tu dois avoir au moins 16 ans.")
});

interface SignUpWizardProps {
  onSwitchTab?: (tab: "sign-in" | "sign-up") => void;
}

export function SignUpWizard({ onSwitchTab }: SignUpWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Preserve prop for compatibility even if the wizard no longer switches steps.
  void onSwitchTab;

  const form = useForm<StepOneValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dob: ""
    }
  });

  const handleSignUp = async (values: StepOneValues) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            first_name: values.firstName,
            last_name: values.lastName
          }
        }
      });

      if (error) {
        if (
          error instanceof AuthApiError &&
          (error.status === 422 ||
            error.status === 400 ||
            error.message.toLowerCase().includes("registered") ||
            error.message.toLowerCase().includes("already") ||
            error.message.toLowerCase().includes("exists"))
        ) {
          toast.info("Un compte existe déjà avec cet email. Redirection vers la connexion...");
          setTimeout(() => {
            router.push("/auth/sign-in");
          }, 1200);
          return;
        }
        throw error;
      }

      const userId = data.user?.id;
      if (!userId) {
        throw new Error("Impossible de récupérer l'identifiant utilisateur.");
      }

      let activeSession = data.session;
      if (!activeSession) {
        const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password
        });

        if (sessionError || !sessionData.session) {
          toast.info(
            "Compte créé. Vérifie ton email de confirmation puis connecte-toi pour accéder à ton espace."
          );
          router.push("/auth/sign-in");
          return;
        }

        activeSession = sessionData.session;
      }

      if (!activeSession) {
        throw new Error("Session introuvable après la création du compte.");
      }

      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        email: values.email,
        first_name: values.firstName,
        last_name: values.lastName,
        dob: values.dob,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      if (profileError) {
        throw profileError;
      }

      toast.success("Compte créé ! Bienvenue sur FinanceBro.");
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible de créer le compte. Réessayez.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Impossible de démarrer la connexion Google.";
      toast.error(message);
      setOauthLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSignUp)} className="grid gap-8">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Informations de base</h3>
        <p className="text-sm text-slate-300/80">
          Ces informations personnalisent tes sessions. L&apos;email servira d&apos;identifiant.
        </p>
      </div>

      <StepOneIdentity form={form} />

      <Button type="submit" size="lg" disabled={isSubmitting || oauthLoading}>
        {isSubmitting ? "Création..." : "Créer mon compte"}
      </Button>

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
          onClick={handleGoogleSignUp}
          disabled={isSubmitting || oauthLoading}
        >
          <svg className="h-4 w-4" viewBox="0 0 533.5 544.3" aria-hidden="true" focusable="false">
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
    </form>
  );
}
