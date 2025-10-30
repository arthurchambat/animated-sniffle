'use client';

import { useEffect, useRef, useState } from "react";
import { FileText, Upload, Trash2, Download, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { updateProfileCvPath, type ProfileRow } from "@/lib/supabase/profile";

const CV_BUCKET = "cvs";
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

interface CvManagerProps {
  userId: string;
  profile: ProfileRow;
  onProfileChange?: (profile: ProfileRow) => void;
}

export function CvManager({ userId, profile, onProfileChange }: CvManagerProps) {
  const supabase = createSupabaseBrowserClient();
  const [currentPath, setCurrentPath] = useState<string | null>(profile.cv_path);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  useEffect(() => {
    setCurrentPath(profile.cv_path);
    setPreviewUrl(null);
  }, [profile.cv_path]);

  const ensurePdf = (file: File) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  const targetPath = `${userId}/cv.pdf`;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ensurePdf(file)) {
      toast.error("Le fichier doit être un PDF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Le fichier est trop volumineux (max ${MAX_FILE_SIZE_MB} Mo).`);
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      if (currentPath) {
        const { error: removeError } = await supabase.storage.from(CV_BUCKET).remove([currentPath]);
        if (removeError && removeError.status !== 404) {
          console.warn("[FinanceBro] Impossible de supprimer l'ancien CV", removeError);
        }
      }

      const { error: uploadError } = await supabase.storage.from(CV_BUCKET).upload(targetPath, file, {
        cacheControl: "0",
        upsert: true,
        contentType: "application/pdf"
      });

      if (uploadError) {
        throw uploadError;
      }

      const updatedProfile = await updateProfileCvPath(supabase, userId, targetPath, profile);
      setCurrentPath(targetPath);
      onProfileChange?.(updatedProfile);
      toast.success("CV importé avec succès.");
    } catch (error) {
      console.error("[FinanceBro] Upload CV failed", error);
      toast.error("Impossible d'importer le CV. Réessaie.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const getSignedUrl = async () => {
    if (!currentPath) {
      throw new Error("Aucun CV disponible");
    }

    const { data, error } = await supabase.storage
      .from(CV_BUCKET)
      .createSignedUrl(currentPath, 60);

    if (error || !data?.signedUrl) {
      throw error ?? new Error("URL invalide");
    }

    return data.signedUrl;
  };

  const handleDownload = async () => {
    if (!currentPath) return;
    setIsDownloading(true);
    try {
      const signedUrl = await getSignedUrl();
      window.open(signedUrl, "_blank");
    } catch (error) {
      console.error("[FinanceBro] Download CV failed", error);
      toast.error("Impossible de télécharger le CV.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePreview = async () => {
    if (!currentPath) return;
    setIsPreviewLoading(true);
    try {
      const signedUrl = await getSignedUrl();
      setPreviewUrl(signedUrl);
    } catch (error) {
      console.error("[FinanceBro] Preview CV failed", error);
      toast.error("Impossible d'afficher le CV.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPath) return;
    setIsDeleting(true);
    try {
      const { error: removeError } = await supabase.storage.from(CV_BUCKET).remove([currentPath]);
      if (removeError) {
        throw removeError;
      }

      const updatedProfile = await updateProfileCvPath(supabase, userId, null, profile);
      setCurrentPath(null);
      onProfileChange?.(updatedProfile);
      toast.success("CV supprimé.");
    } catch (error) {
      console.error("[FinanceBro] Delete CV failed", error);
      toast.error("Impossible de supprimer le CV.");
    } finally {
      setIsDeleting(false);
    }
  };

  const triggerFileDialog = () => {
    if (!isUploading && fileInputRef.current) {
      setPreviewUrl(null);
      fileInputRef.current.click();
    }
  };

  return (
    <BentoCard padding="lg" className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-100">Mon CV</h2>
          <p className="text-sm text-slate-400">
            Importer un CV au format PDF. Il sera utilisé pour personnaliser tes sessions.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button type="button" size="sm" onClick={triggerFileDialog} disabled={isUploading}>
          <Upload className="mr-2 h-4 w-4" />
          {currentPath ? "Remplacer" : "Importer un CV"}
        </Button>
      </div>

      {currentPath ? (
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
              <FileText className="h-6 w-6 text-emerald-200" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-100">
                {currentPath.split("/").pop() ?? "cv.pdf"}
              </p>
              <p className="text-xs text-slate-400">
                Stocké de manière sécurisée. Le remplacement écrase le fichier existant.
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading || isUploading || isDeleting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Télécharger
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={triggerFileDialog}
              disabled={isUploading || isDeleting}
              className="flex items-center gap-2 text-slate-200 hover:text-emerald-200"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              {isUploading ? "Import en cours..." : "Remplacer"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePreview}
              disabled={isPreviewLoading || isDownloading || isUploading || isDeleting}
              className="flex items-center gap-2 text-slate-200 hover:text-emerald-200"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              {isPreviewLoading ? "Chargement..." : "Aperçu"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || isUploading}
              className="flex items-center gap-2 text-rose-300 hover:text-rose-200"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-6 text-center">
          <p className="text-sm text-slate-300">
            Aucun CV importé pour le moment. Ajoute un PDF (max {MAX_FILE_SIZE_MB} Mo) pour enrichir ton
            coaching.
          </p>
        </div>
      )}
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/60">
          <button
            type="button"
            onClick={() => setPreviewUrl(null)}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-1 text-slate-200 hover:bg-white/20"
            aria-label="Fermer l'aperçu"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <iframe
            title="Aperçu du CV"
            src={previewUrl}
            className="h-[480px] w-full"
            loading="lazy"
          />
        </div>
      ) : null}
    </BentoCard>
  );
}
