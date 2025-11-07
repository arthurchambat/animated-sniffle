'use client';

import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DisplayRow } from "./DisplayRow";
import type { ProfileRow } from "@/lib/supabase/profile";
import { deserializeArray } from "@/lib/supabase/profile";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AccountOverviewProps {
  profile: ProfileRow;
  onEditClick: () => void;
}

/**
 * Read-only stacked sections for profile data with Edit my info button.
 * Sections: Identity, Professional (no School/Referral), CV with preview.
 */
export function AccountOverview({ profile, onEditClick }: AccountOverviewProps) {
  const supabase = createSupabaseBrowserClient();

  // Deserialize multi-select fields
  const roleInterests = deserializeArray(profile.role_interest);
  const sectors = deserializeArray(profile.sector);

  const handleDownloadCv = async () => {
    if (!profile.cv_path) {
      toast.error("Aucun CV disponible.");
      return;
    }

    try {
      const { data, error } = await supabase.storage.from("cvs").download(profile.cv_path);

      if (error) {
        throw error;
      }

      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `CV_${profile.first_name}_${profile.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("CV téléchargé avec succès.");
    } catch (error) {
      console.error("[AccountOverview] CV download failed", error);
      toast.error("Impossible de télécharger le CV.");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 md:px-8 md:py-14">
      {/* Header with Edit button */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white md:text-3xl">Mon compte</h1>
          <p className="mt-1 text-sm text-white/70">
            Gère tes informations personnelles et ton CV pour personnaliser tes sessions.
          </p>
        </div>
        <Button onClick={onEditClick} size="sm" className="shrink-0">
          Edit my info
        </Button>
      </div>

      {/* Identity Section */}
      <section className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
        <div>
          <h2 className="text-lg font-semibold text-white">Identité</h2>
          <p className="text-xs text-white/60">Informations personnelles de base</p>
        </div>
        <dl className="space-y-3">
          <DisplayRow label="Prénom" value={profile.first_name} />
          <DisplayRow label="Nom" value={profile.last_name} />
          <DisplayRow label="Email" value={profile.email} />
          <DisplayRow
            label="Date de naissance"
            value={profile.dob ? new Date(profile.dob).toLocaleDateString("fr-FR") : null}
          />
        </dl>
      </section>

      {/* Professional Section - School and Referral removed */}
      <section className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
        <div>
          <h2 className="text-lg font-semibold text-white">Professionnel</h2>
          <p className="text-xs text-white/60">Parcours et objectifs de carrière</p>
        </div>
        <dl className="space-y-3">
          {/* Role interests as comma-separated or chips */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-4">
            <dt className="text-sm font-medium text-muted-foreground md:col-span-4">
              Rôles recherchés
            </dt>
            <dd className="wrap-break-word text-sm text-white/90 md:col-span-8">
              {roleInterests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roleInterests.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 border border-emerald-400/20"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-white/40">Non renseigné</span>
              )}
            </dd>
          </div>

          {/* Sectors as comma-separated or chips */}
          <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-4">
            <dt className="text-sm font-medium text-muted-foreground md:col-span-4">
              Secteurs d'intérêt
            </dt>
            <dd className="wrap-break-word text-sm text-white/90 md:col-span-8">
              {sectors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {sectors.map((sector) => (
                    <span
                      key={sector}
                      className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-200 border border-emerald-400/20"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-white/40">Non renseigné</span>
              )}
            </dd>
          </div>

          <DisplayRow label="Profil LinkedIn" value={profile.linkedin_url} />
        </dl>
      </section>

      {/* CV Section with preview */}
      <section className="space-y-4 rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
        <div>
          <h2 className="text-lg font-semibold text-white">Curriculum Vitae</h2>
          <p className="text-xs text-white/60">Ton CV pour personnaliser les sessions</p>
        </div>
        {profile.cv_path ? (
          <div className="space-y-4">
            {/* CV Preview Thumbnail */}
            <div className="h-40 w-full overflow-hidden rounded-lg border border-white/10 bg-slate-900">
              <object
                data={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cvs/${profile.cv_path}`}
                type="application/pdf"
                className="h-full w-full"
              >
                <div className="flex h-full items-center justify-center p-4 text-center">
                  <div>
                    <FileText className="mx-auto h-8 w-8 text-white/40" />
                    <p className="mt-2 text-sm text-white/60">Aperçu non disponible</p>
                  </div>
                </div>
              </object>
            </div>

            {/* CV File Info + Download */}
            <div className="flex items-center gap-4">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-4">
                <FileText className="h-5 w-5 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">
                    CV_{profile.first_name}_{profile.last_name}.pdf
                  </p>
                  <p className="text-xs text-white/60">Fichier disponible</p>
                </div>
              </div>
              <Button onClick={handleDownloadCv} variant="ghost" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Télécharger
              </Button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-white/20 bg-white/5 p-6 text-center">
            <FileText className="mx-auto h-8 w-8 text-white/40" />
            <p className="mt-2 text-sm text-white/60">Aucun CV uploadé</p>
            <p className="mt-1 text-xs text-white/40">
              Clique sur &quot;Edit my info&quot; pour ajouter ton CV
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

