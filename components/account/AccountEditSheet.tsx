'use client';

import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { cn } from "@/lib/cn";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  type ProfileRow,
  SECTOR_OPTIONS,
  ROLE_INTEREST_OPTIONS,
  updateProfile,
  updateProfileCvPath
} from "@/lib/supabase/profile";

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(120, "Le prénom est trop long."),
  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(120, "Le nom est trop long."),
  dob: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => value === "" || !Number.isNaN(Date.parse(value ?? "")),
      "Date de naissance invalide."
    ),
  school: z.string().max(160, "L'établissement est trop long.").optional().or(z.literal("")),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => value === "" || value?.startsWith("https://"),
      "Le lien doit commencer par https://"
    )
    .refine(
      (value) => {
        if (value === "") return true;
        try {
          const url = new URL(value ?? "");
          return url.hostname.includes("linkedin.");
        } catch {
          return false;
        }
      },
      "Le lien doit pointer vers LinkedIn."
    ),
  sector: z.enum(SECTOR_OPTIONS).optional().or(z.literal("")),
  roleInterest: z.enum(ROLE_INTEREST_OPTIONS).optional().or(z.literal(""))
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface AccountEditSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  profile: ProfileRow;
  onProfileChange: (profile: ProfileRow) => void;
}

const inputClass =
  "w-full rounded-lg border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200";

const selectClass =
  "w-full rounded-lg border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const CV_BUCKET = "cvs";

/**
 * Sheet/Dialog for editing profile fields with react-hook-form + Zod validation.
 * Includes CV upload functionality with file preview.
 */
export function AccountEditSheet({
  open,
  onOpenChange,
  userId,
  profile,
  onProfileChange
}: AccountEditSheetProps) {
  const supabase = createSupabaseBrowserClient();
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile.first_name ?? "",
      lastName: profile.last_name ?? "",
      dob: profile.dob ?? "",
      school: profile.school ?? "",
      linkedinUrl: profile.linkedin_url ?? "",
      sector: (profile.sector ?? "") as any,
      roleInterest: (profile.role_interest ?? "") as any
    }
  });

  // Reset form when profile changes or sheet opens
  useEffect(() => {
    if (open) {
      reset({
        firstName: profile.first_name ?? "",
        lastName: profile.last_name ?? "",
        dob: profile.dob ?? "",
        school: profile.school ?? "",
        linkedinUrl: profile.linkedin_url ?? "",
        sector: (profile.sector ?? "") as any,
        roleInterest: (profile.role_interest ?? "") as any
      });
      setCvFile(null);
    }
  }, [profile, reset, open]);

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

  const onSubmit = handleSubmit(async (values) => {
    try {
      setIsUploading(true);

      // Update profile fields first
      let updated = await updateProfile(
        supabase,
        userId,
        {
          first_name: values.firstName.trim(),
          last_name: values.lastName.trim(),
          dob: values.dob ? values.dob : null,
          school: values.school ? values.school.trim() : null,
          linkedin_url: values.linkedinUrl ? values.linkedinUrl.trim() : null,
          sector: values.sector ? (values.sector as ProfileRow["sector"]) : null,
          role_interest: values.roleInterest ? (values.roleInterest as ProfileRow["role_interest"]) : null
        },
        profile
      );

      // Handle CV upload if file selected
      if (cvFile) {
        const targetPath = `${userId}/cv.pdf`;

        // Remove old CV if exists
        if (profile.cv_path) {
          await supabase.storage.from(CV_BUCKET).remove([profile.cv_path]);
        }

        const { error: uploadError } = await supabase.storage.from(CV_BUCKET).upload(targetPath, cvFile, {
          cacheControl: "0",
          upsert: true,
          contentType: "application/pdf"
        });

        if (uploadError) {
          throw uploadError;
        }

        // Update cv_path separately
        updated = await updateProfileCvPath(supabase, userId, targetPath, updated);
      }

      toast.success("Profil mis à jour avec succès.");
      onProfileChange(updated);
      onOpenChange(false);
    } catch (error) {
      console.error("[AccountEditSheet] Update failed", error);
      toast.error("Impossible d'enregistrer les modifications.");
    } finally {
      setIsUploading(false);
    }
  });

  const handleCancel = () => {
    reset();
    setCvFile(null);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit my info</SheetTitle>
          <SheetDescription>
            Mets à jour tes informations personnelles et professionnelles.
          </SheetDescription>
        </SheetHeader>

        <form id={formId} className="mt-6 space-y-6" onSubmit={onSubmit}>
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Identité</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="edit-first-name">
                Prénom *
              </label>
              <input
                id="edit-first-name"
                type="text"
                autoComplete="given-name"
                className={cn(inputClass, errors.firstName && "border-rose-400/70 focus:ring-rose-200")}
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-rose-300">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="edit-last-name">
                Nom *
              </label>
              <input
                id="edit-last-name"
                type="text"
                autoComplete="family-name"
                className={cn(inputClass, errors.lastName && "border-rose-400/70 focus:ring-rose-200")}
                {...register("lastName")}
              />
              {errors.lastName && <p className="text-xs text-rose-300">{errors.lastName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="edit-dob">
                Date de naissance
              </label>
              <input
                id="edit-dob"
                type="date"
                max={new Date().toISOString().slice(0, 10)}
                className={cn(inputClass, errors.dob && "border-rose-400/70 focus:ring-rose-200")}
                {...register("dob")}
              />
              {errors.dob && <p className="text-xs text-rose-300">{errors.dob.message}</p>}
            </div>
          </div>

          {/* Professional Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Professionnel</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="edit-school">
                École / Université
              </label>
              <input
                id="edit-school"
                type="text"
                placeholder="HEC, ESCP, Centrale..."
                className={cn(inputClass, errors.school && "border-rose-400/70 focus:ring-rose-200")}
                {...register("school")}
              />
              {errors.school && <p className="text-xs text-rose-300">{errors.school.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="edit-role-interest">
                Rôle recherché
              </label>
              <select
                id="edit-role-interest"
                className={cn(selectClass, errors.roleInterest && "border-rose-400/70 focus:ring-rose-200")}
                {...register("roleInterest")}
              >
                <option value="">Sélectionner</option>
                {ROLE_INTEREST_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.roleInterest && (
                <p className="text-xs text-rose-300">{errors.roleInterest.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="edit-sector">
                Secteur d&apos;intérêt
              </label>
              <select
                id="edit-sector"
                className={cn(selectClass, errors.sector && "border-rose-400/70 focus:ring-rose-200")}
                {...register("sector")}
              >
                <option value="">Sélectionner</option>
                {SECTOR_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.sector && <p className="text-xs text-rose-300">{errors.sector.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="edit-linkedin">
                Profil LinkedIn
              </label>
              <input
                id="edit-linkedin"
                type="url"
                placeholder="https://www.linkedin.com/in/..."
                className={cn(inputClass, errors.linkedinUrl && "border-rose-400/70 focus:ring-rose-200")}
                {...register("linkedinUrl")}
              />
              {errors.linkedinUrl ? (
                <p className="text-xs text-rose-300">{errors.linkedinUrl.message}</p>
              ) : (
                <p className="text-xs text-slate-400">
                  Utilisé pour personnaliser tes sessions de fit et te recommander du contenu pertinent.
                </p>
              )}
            </div>
          </div>

          {/* CV Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Curriculum Vitae</h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {cvFile ? (
              <div className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-emerald-400" />
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-white/20 bg-slate-950/30 p-6 transition-colors hover:border-emerald-300/50 hover:bg-slate-950/50"
              >
                <Upload className="h-6 w-6 text-emerald-200" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-200">
                    {profile.cv_path ? "Remplacer le CV" : "Uploader un CV"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">PDF - Maximum {MAX_FILE_SIZE_MB} Mo</p>
                </div>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-6">
            <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSubmitting || isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              form={formId}
              disabled={isSubmitting || isUploading || (!isDirty && !cvFile)}
            >
              {isSubmitting || isUploading ? "Enregistrement..." : "Save"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
