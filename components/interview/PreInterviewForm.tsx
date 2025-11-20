"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Rocket, Briefcase, Target, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { FileDropzone } from "@/components/auth/FileDropzone";
import { BentoCard } from "@/components/ui/bento-card";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { FocusArea, InterviewRound } from "@/lib/types/interview";

const preInterviewSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  position_round: z.enum(['screening', 'tech', 'final', 'case', 'fit']),
  company: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  role: z.string().min(2, "Le rôle doit contenir au moins 2 caractères"),
  focus_areas: z.array(z.string()).optional(),
  duration_minutes: z.number().min(15).max(120).default(30),
  cvFile: z.instanceof(File).optional().nullable(),
  jobOfferFile: z.instanceof(File).optional().nullable(),
});

type PreInterviewFormData = z.infer<typeof preInterviewSchema>;

const ROUNDS: { value: InterviewRound; label: string }[] = [
  { value: 'screening', label: 'Screening initial' },
  { value: 'tech', label: 'Entretien technique' },
  { value: 'case', label: 'Étude de cas' },
  { value: 'fit', label: 'Entretien fit culturel' },
  { value: 'final', label: 'Entretien final' },
];

const COMPANIES = [
  'Goldman Sachs',
  'Morgan Stanley',
  'JP Morgan',
  'Rothschild & Co',
  'Lazard',
  'BNP Paribas',
  'Société Générale',
  'Crédit Agricole CIB',
  'BlackRock',
  'KKR',
  'Bain Capital',
  'CVC Capital',
  'Autre',
];

const ROLES = [
  'Analyst',
  'Associate',
  'Vice President',
  'Director',
  'Managing Director',
  'Intern / Stagiaire',
  'Autre',
];

const FOCUS_AREAS_OPTIONS = [
  { value: 'valuation', label: 'Valorisation' },
  { value: 'accounting', label: 'Comptabilité' },
  { value: 'markets', label: 'Marchés financiers' },
  { value: 'fit', label: 'Questions comportementales' },
  { value: 'technical', label: 'Questions techniques' },
  { value: 'case-study', label: 'Résolution de cas' },
  { value: 'behavioral', label: 'Questions situationnelles' },
];

interface PreInterviewFormProps {
  existingCvPath?: string | null;
  userId: string;
}

export function PreInterviewForm({ existingCvPath, userId }: PreInterviewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useExistingCV, setUseExistingCV] = useState(!!existingCvPath);
  const supabase = createSupabaseBrowserClient();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<PreInterviewFormData>({
    resolver: zodResolver(preInterviewSchema),
    defaultValues: {
      title: "",
      company: "",
      role: "",
      duration_minutes: 30,
      focus_areas: [],
    },
  });

  const onSubmit = async (data: PreInterviewFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Créer la session en draft
      const { data: session, error: sessionError } = await supabase
        .from('interview_sessions')
        .insert({
          user_id: userId,
          title: data.title,
          position_round: data.position_round,
          company: data.company,
          role: data.role,
          focus_areas: data.focus_areas || [],
          duration_minutes: data.duration_minutes,
          status: 'draft',
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // 2. Upload CV si nouveau fichier
      let cvPath = null;
      if (data.cvFile) {
        const fileName = `${userId}/cv_${session.id}_${Date.now()}.pdf`;
        const { error: cvUploadError } = await supabase.storage
          .from('interviews')
          .upload(fileName, data.cvFile);

        if (cvUploadError) throw cvUploadError;
        cvPath = fileName;
      } else if (useExistingCV && existingCvPath) {
        cvPath = existingCvPath;
      }

      // 3. Upload job offer si présent
      let jobOfferPath = null;
      if (data.jobOfferFile) {
        const fileName = `${userId}/offer_${session.id}_${Date.now()}.pdf`;
        const { error: offerUploadError } = await supabase.storage
          .from('interviews')
          .upload(fileName, data.jobOfferFile);

        if (offerUploadError) throw offerUploadError;
        jobOfferPath = fileName;
      }

      // 4. Mettre à jour la session avec les paths
      if (cvPath || jobOfferPath) {
        const { error: updateError } = await supabase
          .from('interview_sessions')
          .update({
            cv_path: cvPath,
            job_offer_path: jobOfferPath,
          })
          .eq('id', session.id);

        if (updateError) throw updateError;
      }

      toast.success("Session créée ! Redirection vers l'interview...");
      router.push(`/interview/live/${session.id}`);
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error(error.message || "Erreur lors de la création de la session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Informations générales */}
      <BentoCard padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <Briefcase className="h-5 w-5 text-emerald-200" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Informations générales</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Input
              label="Nom de l'interview"
              placeholder="Ex: Goldman Sachs - M&A Analyst Screening"
              error={errors.title?.message || undefined}
              required
              {...register('title')}
            />
          </div>

          <Select
            label="Type d'entretien"
            error={errors.position_round?.message || undefined}
            required
            {...register('position_round')}
          >
            <option value="">Sélectionner un type</option>
            {ROUNDS.map((round) => (
              <option key={round.value} value={round.value}>
                {round.label}
              </option>
            ))}
          </Select>

          <Input
            label="Durée (minutes)"
            type="number"
            min={15}
            max={120}
            error={errors.duration_minutes?.message || undefined}
            {...register('duration_minutes', { valueAsNumber: true })}
          />

          <Controller
            name="company"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Entreprise <span className="text-rose-400 ml-1">*</span>
                </label>
                <input
                  {...field}
                  value={field.value ?? ""}
                  list="companies"
                  placeholder="Sélectionner ou saisir"
                  className="w-full rounded-(--radius) border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <datalist id="companies">
                  {COMPANIES.map((company) => (
                    <option key={company} value={company} />
                  ))}
                </datalist>
                {errors.company && <p className="text-xs text-rose-300">{errors.company.message}</p>}
              </div>
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">
                  Poste <span className="text-rose-400 ml-1">*</span>
                </label>
                <input
                  {...field}
                  value={field.value ?? ""}
                  list="roles"
                  placeholder="Sélectionner ou saisir"
                  className="w-full rounded-(--radius) border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
                <datalist id="roles">
                  {ROLES.map((role) => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
                {errors.role && <p className="text-xs text-rose-300">{errors.role.message}</p>}
              </div>
            )}
          />
        </div>
      </BentoCard>

      {/* Focus areas */}
      <BentoCard padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <Target className="h-5 w-5 text-emerald-200" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Axes de travail</h2>
        </div>

        <Controller
          name="focus_areas"
          control={control}
          render={({ field }) => (
            <MultiSelect
              options={FOCUS_AREAS_OPTIONS}
              value={field.value || []}
              onChange={field.onChange}
              placeholder="Sélectionnez les compétences que vous souhaitez travailler"
              helperText="Facultatif mais recommandé pour personnaliser les questions"
            />
          )}
        />
      </BentoCard>

      {/* Documents */}
      <BentoCard padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <FileText className="h-5 w-5 text-emerald-200" />
          </div>
          <h2 className="text-xl font-semibold text-slate-100">Documents</h2>
        </div>

        <div className="space-y-4">
          {/* CV */}
          <div>
            {existingCvPath && (
              <div className="mb-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30 flex items-start justify-between">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-emerald-200 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-emerald-100">CV existant détecté</p>
                    <p className="text-xs text-emerald-200/70">Nous utiliserons votre CV de profil</p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setUseExistingCV(!useExistingCV)}
                  className="text-xs"
                >
                  {useExistingCV ? "Remplacer" : "Utiliser"}
                </Button>
              </div>
            )}

            {(!existingCvPath || !useExistingCV) && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">CV (optionnel)</label>
                <Controller
                  name="cvFile"
                  control={control}
                  render={({ field }) => (
                    <FileDropzone
                      file={field.value || null}
                      onFileSelect={field.onChange}
                      disabled={isSubmitting}
                      error={errors.cvFile?.message as string}
                    />
                  )}
                />
                <p className="text-xs text-slate-400">Le CV permet de personnaliser les questions comportementales</p>
              </div>
            )}
          </div>

          {/* Job Offer */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">Offre d'emploi (optionnel)</label>
            <Controller
              name="jobOfferFile"
              control={control}
              render={({ field }) => (
                <FileDropzone
                  file={field.value || null}
                  onFileSelect={field.onChange}
                  disabled={isSubmitting}
                  error={errors.jobOfferFile?.message as string}
                />
              )}
            />
            <p className="text-xs text-slate-400">L'offre permet d'adapter les questions au contexte du poste</p>
          </div>
        </div>
      </BentoCard>

      {/* Submit */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          {isSubmitting ? (
            "Préparation..."
          ) : (
            <>
              <Rocket className="mr-2 h-5 w-5" />
              Lancer l'interview
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
