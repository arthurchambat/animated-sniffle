'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthApiError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { StepOneIdentity, type StepOneValues } from "@/components/auth/StepOneIdentity";
import { StepTwoDetails } from "@/components/auth/StepTwoDetails";

const STORAGE_KEY = "financebro-signup-step2";

const MIN_PASSWORD_LENGTH = 8;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const SECTOR_OPTIONS = [
  "finance de marché",
  "m&a",
  "private equity",
  "conseil",
  "risk",
  "data",
  "autre"
] as const;

const REFERRAL_OPTIONS = ["ami", "linkedin", "google", "université", "événement", "autre"] as const;

const isAtLeast16 = (dob: string) => {
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }
  const today = new Date();
  const sixteenYearsAgo = new Date(
    today.getFullYear() - 16,
    today.getMonth(),
    today.getDate()
  );
  return birthDate <= sixteenYearsAgo;
};

const stepOneSchema = z.object({
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
  dob: z
    .string()
    .refine((value) => isAtLeast16(value), "Tu dois avoir au moins 16 ans.")
});

const stepTwoSchema = z.object({
  cvFile: z
    .any()
    .optional()
    .refine((file) => !file || file instanceof File, { message: "Fichier invalide." })
    .refine((file) => !file || file.type === "application/pdf", {
      message: "Le CV doit être un PDF."
    })
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, {
      message: `Fichier trop volumineux (max ${MAX_FILE_SIZE_MB} Mo).`
    }),
  linkedin: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || value.startsWith("https://"), {
      message: "Le lien doit commencer par https://"
    })
    .refine((value) => {
      if (!value) return true;
      try {
        const url = new URL(value);
        return url.hostname.includes("linkedin.");
      } catch {
        return false;
      }
    }, { message: "Le lien doit pointer vers LinkedIn." })
    .transform((value) => (value ? value : undefined)),
  school: z
    .string()
    .trim()
    .max(120, "Nom d'école trop long.")
    .optional()
    .transform((value) => (value ? value : undefined)),
  sector: z
    .enum(SECTOR_OPTIONS)
    .optional()
    .transform((value) => (value ? (value as SectorOption) : undefined)),
  referral: z
    .enum(REFERRAL_OPTIONS)
    .optional()
    .transform((value) => (value ? (value as ReferralOption) : undefined))
});

export type StepTwoValues = z.infer<typeof stepTwoSchema>;
type SectorOption = (typeof SECTOR_OPTIONS)[number];
type ReferralOption = (typeof REFERRAL_OPTIONS)[number];

interface SignUpWizardProps {
  onSwitchTab?: (tab: "sign-in" | "sign-up") => void;
}

type StepState = 1 | 2;

export function SignUpWizard({ onSwitchTab }: SignUpWizardProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [step, setStep] = useState<StepState>(1);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);
  const [stepOneLoading, setStepOneLoading] = useState(false);
  const [stepTwoLoading, setStepTwoLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  const stepOneForm = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      dob: ""
    }
  });

  const stepTwoForm = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      cvFile: undefined,
      linkedin: undefined,
      school: undefined,
      sector: undefined,
      referral: undefined
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const storedRaw = window.localStorage.getItem(STORAGE_KEY);
    if (!storedRaw) {
      return;
    }
    try {
      const parsed = JSON.parse(storedRaw) as Partial<StepTwoValues>;
      stepTwoForm.reset({
        cvFile: undefined,
        linkedin: parsed.linkedin ?? undefined,
        school: parsed.school ?? undefined,
        sector: parsed.sector ?? undefined,
        referral: parsed.referral ?? undefined
      });
    } catch (error) {
      console.warn("[FinanceBro] Impossible de parser les informations sauvegardées", error);
    }
  }, [stepTwoForm]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const subscription = stepTwoForm.watch((value) => {
      try {
        const { cvFile: _cvFile, ...persistable } = value;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
      } catch (error) {
        console.warn("[FinanceBro] Impossible de sauvegarder les données step 2", error);
      }
    });
    return () => subscription.unsubscribe();
  }, [stepTwoForm]);

  const handleStepOneSubmit = async (values: StepOneValues) => {
    setStepOneLoading(true);
    try {
      if (!createdUserId) {
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
            }, 1500);
            return;
          }
          throw error;
        }

        const userId = data.user?.id;
        if (!userId) {
          throw new Error("Impossible de récupérer l'identifiant utilisateur.");
        }

        // Ensure session is active (Supabase peut retourner session null selon la config)
        if (!data.session) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password
          });
          if (signInError) {
            toast.info(
              "Compte créé. Vérifie ton email de confirmation puis connecte-toi pour compléter ton profil."
            );
            setCreatedUserId(userId);
            setCreatedEmail(values.email);
            return;
          }
          if (!signInData.session) {
            toast.info(
              "Compte créé. Vérifie ton email de confirmation puis connecte-toi pour compléter ton profil."
            );
            setCreatedUserId(userId);
            setCreatedEmail(values.email);
            return;
          }
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

        setCreatedUserId(userId);
        setCreatedEmail(values.email);
        toast.success("Compte créé ! Complète les détails optionnels.");
        setStep(2);
      } else {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            first_name: values.firstName,
            last_name: values.lastName,
            dob: values.dob,
            updated_at: new Date().toISOString()
          })
          .eq("id", createdUserId);

        if (updateError) {
          throw updateError;
        }

        toast.success("Informations mises à jour.");
        setStep(2);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible de créer le compte. Réessayez.";
      toast.error(message);
    } finally {
      setStepOneLoading(false);
    }
  };

  const handleSkipStepTwo = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    toast.message("Tu pourras compléter ton profil plus tard depuis ton espace.");
    window.location.href = "/dashboard";
  };

  const handleStepTwoSubmit = async (values: StepTwoValues) => {
    if (!createdUserId) {
      toast.error("Session introuvable. Reviens à l'étape 1.");
      setStep(1);
      return;
    }

    setStepTwoLoading(true);
    try {
      let cvPath: string | undefined;
      if (values.cvFile instanceof File) {
        const filePath = `cv/${createdUserId}.pdf`;
        const { error: uploadError } = await supabase.storage
          .from("cv")
          .upload(filePath, values.cvFile, {
            contentType: "application/pdf",
            upsert: true
          });

        if (uploadError) {
          throw uploadError;
        }
        cvPath = filePath;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          linkedin_url: values.linkedin ?? null,
          school: values.school ?? null,
          sector: values.sector ?? null,
          referral: values.referral ?? null,
          cv_path: cvPath ?? undefined,
          updated_at: new Date().toISOString()
        })
        .eq("id", createdUserId);

      if (updateError) {
        throw updateError;
      }

      if (typeof window !== "undefined") {
        window.localStorage.removeItem(STORAGE_KEY);
      }

      toast.success("Profil complété. Bienvenue !");
      window.location.href = "/dashboard";
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Impossible d'enregistrer les détails.";
      toast.error(message);
      setStepTwoLoading(false);
    }
  };

  const disabledFields = useMemo(
    () => ({
      email: Boolean(createdUserId),
      password: Boolean(createdUserId)
    }),
    [createdUserId]
  );

  const handleGoogleSignUp = async () => {
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
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

  return step === 1 ? (
    <form onSubmit={stepOneForm.handleSubmit(handleStepOneSubmit)} className="grid gap-8">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Informations de base</h3>
        <p className="text-sm text-slate-300/80">
          Ces informations personnalisent tes sessions. L&apos;email servira d&apos;identifiant.
        </p>
      </div>
      <StepOneIdentity form={stepOneForm} disabledFields={disabledFields} />
      {createdEmail ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-slate-300/80">
          Ton compte <span className="font-semibold text-emerald-200">{createdEmail}</span> est créé.
          Tu peux ajuster ton prénom, nom ou date de naissance puis poursuivre.
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={stepOneLoading || oauthLoading}>
        {createdUserId ? "Continuer" : "Suivant"}
      </Button>

      {!createdUserId && (
        <>
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
              disabled={stepOneLoading || oauthLoading}
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
        </>
      )}
    </form>
  ) : (
    <form onSubmit={stepTwoForm.handleSubmit(handleStepTwoSubmit)} className="grid gap-8">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-white">Détails optionnels</h3>
        <p className="text-sm text-slate-300/80">
          Ces éléments affinent ton coaching et débloquent des insights personnalisés. Tu peux passer cette étape.
        </p>
      </div>
      <StepTwoDetails
        form={stepTwoForm}
        isSubmitting={stepTwoLoading}
        onBack={() => setStep(1)}
        onSkip={handleSkipStepTwo}
      />
    </form>
  );
}
