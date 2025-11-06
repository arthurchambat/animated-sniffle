'use client';

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getCurrentProfile,
  upsertOnboardingProfile,
  SECTOR_OPTIONS,
  REFERRAL_OPTIONS,
  ROLE_INTEREST_OPTIONS,
  type ProfileRow
} from "@/lib/supabase/profile";

const inputClass =
  "w-full rounded-[var(--radius)] border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200";

const selectClass =
  "w-full rounded-[var(--radius)] border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200";

const CV_BUCKET = "cvs";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [sector, setSector] = useState("");
  const [roleInterest, setRoleInterest] = useState("");
  const [referral, setReferral] = useState("");

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const { user, profile } = await getCurrentProfile(supabase);

        if (!user) {
          router.replace("/auth/sign-in");
          return;
        }

        if (cancelled) {
          return;
        }

        setUserId(user.id);
        setProfile(profile);

        // Pre-fill if data exists
        if (profile) {
          setFirstName(profile.first_name ?? "");
          setLastName(profile.last_name ?? "");
          setDob(profile.dob ?? "");
          setSector(profile.sector ?? "");
          setRoleInterest(profile.role_interest ?? "");
          setReferral(profile.referral ?? "");
        }
      } catch (error) {
        console.error("[FinanceBro] Unable to load profile for onboarding", error);
        toast.error("Impossible de charger ton profil.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast.error("Le fichier doit être un PDF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Le fichier est trop volumineux (max ${MAX_FILE_SIZE_MB} Mo).`);
      event.target.value = "";
      return;
    }

    setCvFile(file);
    toast.success(`CV sélectionné : ${file.name}`);
  };

  const handleNext = () => {
    // Validate all required fields
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("Merci de renseigner ton prénom et nom.");
      return;
    }
    
    if (!sector || !roleInterest || !referral) {
      toast.error("Merci de remplir tous les champs avant de continuer.");
      return;
    }
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleFinish = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      let cvPath: string | null = profile?.cv_path ?? null;

      // Upload CV if provided
      if (cvFile) {
        const targetPath = `${userId}/cv.pdf`;

        // Remove old CV if exists
        if (profile?.cv_path) {
          const { error: removeError } = await supabase.storage.from(CV_BUCKET).remove([profile.cv_path]);
          if (removeError) {
            console.warn("[FinanceBro] Unable to remove old CV", removeError);
          }
        }

        const { error: uploadError } = await supabase.storage.from(CV_BUCKET).upload(targetPath, cvFile, {
          cacheControl: "0",
          upsert: true,
          contentType: "application/pdf"
        });

        if (uploadError) {
          throw uploadError;
        }

        cvPath = targetPath;
      }

      // Update profile with onboarding data
      await upsertOnboardingProfile(
        supabase,
        userId,
        {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          dob: dob || null,
          sector,
          referral,
          role_interest: roleInterest,
          cv_path: cvPath
        },
        profile
      );

      toast.success("Bienvenue sur FinanceBro ! 🚀");
      router.replace("/dashboard");
    } catch (error) {
      console.error("[FinanceBro] Onboarding save failed", error);
      toast.error("Impossible de finaliser l'inscription. Réessaie.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-400">Chargement...</p>
      </div>
    );
  }

  return (
    <BentoCard padding="lg" className="mx-auto max-w-2xl space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2">
        <div
          className={cn(
            "h-2 w-16 rounded-full transition-colors",
            step === 1 ? "bg-emerald-400" : "bg-emerald-400/30"
          )}
        />
        <div
          className={cn(
            "h-2 w-16 rounded-full transition-colors",
            step === 2 ? "bg-emerald-400" : "bg-slate-600"
          )}
        />
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Parle-nous de toi</h2>
            <p className="mt-2 text-sm text-slate-400">
              Ces informations nous aideront à personnaliser tes sessions d'interview.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="onboarding-first-name">
                  Prénom *
                </label>
                <input
                  id="onboarding-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean"
                  className={inputClass}
                  autoComplete="given-name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200" htmlFor="onboarding-last-name">
                  Nom *
                </label>
                <input
                  id="onboarding-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Dupont"
                  className={inputClass}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="onboarding-dob">
                Date de naissance
              </label>
              <input
                id="onboarding-dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
              />
              <p className="text-xs text-slate-400">
                Optionnel - nous aide à mieux comprendre ton parcours
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="onboarding-sector">
                Secteur d&apos;intérêt *
              </label>
              <select
                id="onboarding-sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionner un secteur</option>
                {SECTOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="onboarding-role">
                Rôle recherché *
              </label>
              <select
                id="onboarding-role"
                value={roleInterest}
                onChange={(e) => setRoleInterest(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionner un rôle</option>
                {ROLE_INTEREST_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="onboarding-referral">
                Comment as-tu entendu parler de nous ? *
              </label>
              <select
                id="onboarding-referral"
                value={referral}
                onChange={(e) => setReferral(e.target.value)}
                className={selectClass}
              >
                <option value="">Sélectionner une source</option>
                {REFERRAL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleNext} size="lg" className="gap-2">
              Continuer
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: CV upload (optional) */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-slate-100">Importe ton CV (optionnel)</h2>
            <p className="mt-2 text-sm text-slate-400">
              Un CV nous permettra de personnaliser davantage tes sessions. Tu pourras toujours l'ajouter
              plus tard dans Mon compte.
            </p>
          </div>

          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {cvFile ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                    <FileText className="h-6 w-6 text-emerald-200" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-100">{cvFile.name}</p>
                    <p className="text-xs text-slate-400">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} Mo
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCvFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="text-rose-300 hover:text-rose-200"
                  >
                    Retirer
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 bg-slate-950/30 p-8 transition-colors hover:border-emerald-300/50 hover:bg-slate-950/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Upload className="h-6 w-6 text-emerald-200" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-200">
                    Clique pour sélectionner un PDF
                  </p>
                  <p className="mt-1 text-xs text-slate-400">Maximum {MAX_FILE_SIZE_MB} Mo</p>
                </div>
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <Button onClick={handleBack} variant="ghost" size="lg" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </Button>
            <Button onClick={handleFinish} disabled={isSaving} size="lg">
              {isSaving ? "Finalisation..." : "Terminer"}
            </Button>
          </div>
        </div>
      )}
    </BentoCard>
  );
}
