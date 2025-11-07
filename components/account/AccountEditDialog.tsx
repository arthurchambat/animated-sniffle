'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Upload, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { TagMultiSelect } from '@/components/account/TagMultiSelect';
import { cn } from '@/lib/cn';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  type ProfileRow,
  SECTOR_OPTIONS,
  ROLE_INTEREST_OPTIONS,
  updateProfile,
  updateProfileCvPath,
  serializeArray,
  deserializeArray
} from '@/lib/supabase/profile';

const profileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères.')
    .max(120, 'Le prénom est trop long.'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères.')
    .max(120, 'Le nom est trop long.'),
  dob: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => value === '' || !Number.isNaN(Date.parse(value ?? '')),
      'Date de naissance invalide.'
    ),
  linkedinUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(
      (value) => value === '' || value?.startsWith('https://'),
      "Le lien doit commencer par https://"
    )
    .refine(
      (value) => {
        if (value === '') return true;
        try {
          const url = new URL(value ?? '');
          return url.hostname.includes('linkedin.');
        } catch {
          return false;
        }
      },
      'Le lien doit pointer vers LinkedIn.'
    ),
  sectors: z.array(z.string()),
  roleInterests: z.array(z.string())
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface AccountEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  profile: ProfileRow;
  onProfileChange: (profile: ProfileRow) => void;
}

const inputClass =
  'w-full rounded-lg border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200';

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const CV_BUCKET = 'cvs';

/**
 * Centered dialog for editing profile with multi-select for roles/sectors.
 * Removed School and Referral fields (kept in database, just not editable here).
 */
export function AccountEditDialog({
  open,
  onOpenChange,
  userId,
  profile,
  onProfileChange
}: AccountEditDialogProps) {
  const supabase = createSupabaseBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: {
      firstName: profile.first_name ?? '',
      lastName: profile.last_name ?? '',
      dob: profile.dob ?? '',
      linkedinUrl: profile.linkedin_url ?? '',
      sectors: deserializeArray(profile.sector),
      roleInterests: deserializeArray(profile.role_interest)
    }
  });

  const sectors = watch('sectors');
  const roleInterests = watch('roleInterests');

  useEffect(() => {
    if (open) {
      reset({
        firstName: profile.first_name ?? '',
        lastName: profile.last_name ?? '',
        dob: profile.dob ?? '',
        linkedinUrl: profile.linkedin_url ?? '',
        sectors: deserializeArray(profile.sector),
        roleInterests: deserializeArray(profile.role_interest)
      });
      setCvFile(null);
    }
  }, [open, profile, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Le CV doit être au format PDF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Le fichier est trop volumineux (max ${MAX_FILE_SIZE_MB} MB).`);
      return;
    }

    setCvFile(file);
    toast.success(`${file.name} sélectionné`);
  };

  const removeSelectedFile = () => {
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);

    try {
      // Update profile fields (excluding CV)
      const updatedProfile = await updateProfile(
        supabase,
        userId,
        {
          first_name: data.firstName,
          last_name: data.lastName,
          dob: data.dob || null,
          linkedin_url: data.linkedinUrl || null,
          sector: serializeArray(data.sectors),
          role_interest: serializeArray(data.roleInterests)
        },
        profile
      );

      let finalProfile = updatedProfile;

      // Upload CV if a new file was selected
      if (cvFile) {
        const fileName = `${userId}/cv.pdf`;
        const { error: uploadError } = await supabase.storage
          .from(CV_BUCKET)
          .upload(fileName, cvFile, {
            upsert: true,
            contentType: 'application/pdf'
          });

        if (uploadError) {
          throw new Error(`Échec de l'upload du CV: ${uploadError.message}`);
        }

        const cvPath = fileName;
        finalProfile = await updateProfileCvPath(supabase, userId, cvPath, updatedProfile);
      }

      onProfileChange(finalProfile);
      toast.success('Profil mis à jour');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
          <DialogDescription>
            Mets à jour tes informations personnelles et professionnelles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          {/* Identity Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400">Identité</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-slate-200">
                  Prénom <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('firstName')}
                  id="firstName"
                  type="text"
                  placeholder="Arthur"
                  className={cn(inputClass, errors.firstName && 'border-red-400')}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-slate-200">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('lastName')}
                  id="lastName"
                  type="text"
                  placeholder="Chambat"
                  className={cn(inputClass, errors.lastName && 'border-red-400')}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="dob" className="text-sm font-medium text-slate-200">
                Date de naissance
              </label>
              <input
                {...register('dob')}
                id="dob"
                type="date"
                className={cn(inputClass, errors.dob && 'border-red-400')}
              />
              {errors.dob && <p className="text-xs text-red-400">{errors.dob.message}</p>}
            </div>
          </div>

          {/* Professional Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400">Professionnel</h3>

            <TagMultiSelect
              label="Rôles d'intérêt"
              options={[...ROLE_INTEREST_OPTIONS]}
              value={roleInterests}
              onChange={(value) => setValue('roleInterests', value, { shouldDirty: true })}
              placeholder="Sélectionne tes rôles..."
            />

            <TagMultiSelect
              label="Secteurs"
              options={[...SECTOR_OPTIONS]}
              value={sectors}
              onChange={(value) => setValue('sectors', value, { shouldDirty: true })}
              placeholder="Sélectionne tes secteurs..."
            />

            <div className="space-y-2">
              <label htmlFor="linkedinUrl" className="text-sm font-medium text-slate-200">
                LinkedIn URL
              </label>
              <input
                {...register('linkedinUrl')}
                id="linkedinUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/..."
                className={cn(inputClass, errors.linkedinUrl && 'border-red-400')}
              />
              {errors.linkedinUrl && (
                <p className="text-xs text-red-400">{errors.linkedinUrl.message}</p>
              )}
            </div>
          </div>

          {/* CV Upload Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-emerald-400">CV</h3>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {cvFile ? (
                <div className="flex items-center gap-3 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <FileText className="h-5 w-5 text-emerald-400" />
                  <div className="flex-1 text-sm text-slate-200">{cvFile.name}</div>
                  <button
                    type="button"
                    onClick={removeSelectedFile}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                    aria-label="Retirer le fichier"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {profile.cv_path ? 'Remplacer le CV' : 'Uploader un CV'}
                </Button>
              )}

              <p className="text-xs text-slate-400">Format PDF, maximum {MAX_FILE_SIZE_MB} MB</p>
            </div>
          </div>

          {/* Action Buttons */}
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={(!isDirty && !cvFile) || isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
