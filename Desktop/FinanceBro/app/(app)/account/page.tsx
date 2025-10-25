"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageHeader } from "@/components/app/PageHeader";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { LogOut, User, FileText, Download, Upload, Edit2, Save, X, Trash2, ExternalLink, Eye } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  dob: z.string().optional(),
  school: z.string().optional(),
  sector: z.string().optional(),
  linkedinUrl: z.string().url("URL invalide").optional().or(z.literal("")),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  dob?: string | null;
  school?: string | null;
  sector?: string | null;
  linkedinUrl?: string | null;
  cvPath?: string | null;
}

const inputClass = "w-full rounded-[var(--radius)] border border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed";

const sectors = [
  "finance de marché",
  "m&a",
  "private equity",
  "conseil",
  "risk",
  "data",
  "autre"
] as const;

export default function AccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [isDeletingCV, setIsDeletingCV] = useState(false);
  const [showCVPreview, setShowCVPreview] = useState(false);
  const [cvPreviewUrl, setCvPreviewUrl] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const supabase = createSupabaseBrowserClient();

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  // Charger les données du profil
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/auth/sign-in";
          return;
        }

        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name, dob, school, sector, linkedin_url, cv_path")
          .eq("id", user.id)
          .single();

        const userProfile: UserProfile = {
          email: user.email ?? "",
          firstName: profileData?.first_name ?? "",
          lastName: profileData?.last_name ?? "",
          dob: profileData?.dob ?? null,
          school: profileData?.school ?? null,
          sector: profileData?.sector ?? null,
          linkedinUrl: profileData?.linkedin_url ?? null,
          cvPath: profileData?.cv_path ?? null,
        };

        setProfile(userProfile);
        reset({
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          dob: userProfile.dob || "",
          school: userProfile.school || "",
          sector: userProfile.sector || "",
          linkedinUrl: userProfile.linkedinUrl || "",
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [supabase, reset]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success("Déconnexion réussie");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          dob: data.dob || null,
          school: data.school || null,
          sector: data.sector || null,
          linkedin_url: data.linkedinUrl || null,
        })
        .eq("id", user.id);

      if (error) throw error;

      setProfile((prev) => prev ? {
        ...prev,
        firstName: data.firstName,
        lastName: data.lastName,
        dob: data.dob || null,
        school: data.school || null,
        sector: data.sector || null,
        linkedinUrl: data.linkedinUrl || null,
      } : null);
      setIsEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type et la taille
    if (file.type !== "application/pdf") {
      toast.error("Seuls les fichiers PDF sont acceptés");
      e.target.value = ""; // Reset input
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 5 Mo");
      e.target.value = ""; // Reset input
      return;
    }

    setIsUploadingCV(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Si un CV existe déjà, le supprimer d'abord
      if (profile?.cvPath) {
        const { error: deleteError } = await supabase.storage
          .from("cvs")
          .remove([profile.cvPath]);
        
        if (deleteError) {
          console.warn("Could not delete old CV:", deleteError);
        }
      }

      // Upload vers Supabase Storage avec un chemin organisé par user
      const fileName = `${user.id}/${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Mettre à jour le profil avec le chemin du CV
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cv_path: fileName })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, cvPath: fileName } : null);
      toast.success("CV uploadé avec succès");
    } catch (error: any) {
      console.error("Error uploading CV:", error);
      if (error.message?.includes("Bucket not found")) {
        toast.error("Le bucket de stockage n'existe pas. Veuillez contacter le support.");
      } else {
        toast.error("Erreur lors de l'upload du CV");
      }
    } finally {
      setIsUploadingCV(false);
      e.target.value = ""; // Reset input
    }
  };

  const handleCVDownload = async () => {
    if (!profile?.cvPath) return;

    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .download(profile.cvPath);

      if (error) throw error;

      // Créer un lien de téléchargement
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CV_${profile.firstName}_${profile.lastName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CV téléchargé");
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  const handleCVPreview = async () => {
    if (!profile?.cvPath) return;

    try {
      const { data, error } = await supabase.storage
        .from("cvs")
        .download(profile.cvPath);

      if (error) throw error;

      // Créer une URL blob pour le PDF
      const url = URL.createObjectURL(data);
      setCvPreviewUrl(url);
      setShowCVPreview(true);
    } catch (error) {
      console.error("Error previewing CV:", error);
      toast.error("Erreur lors de l'aperçu du CV");
    }
  };

  const handleCloseCVPreview = () => {
    if (cvPreviewUrl) {
      URL.revokeObjectURL(cvPreviewUrl);
      setCvPreviewUrl(null);
    }
    setShowCVPreview(false);
  };

  const handleCVView = async () => {
    if (!profile?.cvPath) return;

    try {
      const { data } = await supabase.storage
        .from("cvs")
        .getPublicUrl(profile.cvPath);

      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
      } else {
        // Si le bucket est privé, on télécharge et ouvre
        await handleCVDownload();
      }
    } catch (error) {
      console.error("Error viewing CV:", error);
      toast.error("Erreur lors de l'ouverture du CV");
    }
  };

  const handleCVDelete = async () => {
    if (!profile?.cvPath) return;
    
    if (!confirm("Êtes-vous sûr de vouloir supprimer votre CV ? Cette action est irréversible.")) {
      return;
    }

    setIsDeletingCV(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Supprimer du storage
      const { error: deleteError } = await supabase.storage
        .from("cvs")
        .remove([profile.cvPath]);

      if (deleteError) throw deleteError;

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ cv_path: null })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setProfile((prev) => prev ? { ...prev, cvPath: null } : null);
      toast.success("CV supprimé avec succès");
    } catch (error) {
      console.error("Error deleting CV:", error);
      toast.error("Erreur lors de la suppression du CV");
    } finally {
      setIsDeletingCV(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon compte"
        subtitle="Gérez vos informations personnelles et votre CV."
        actions={
          <Button onClick={handleLogout} variant="secondary" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Se déconnecter
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Informations personnelles */}
        <BentoCard padding="lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                <User className="h-5 w-5 text-emerald-200" />
              </div>
              <h2 className="text-xl font-semibold text-slate-100">Informations personnelles</h2>
            </div>
            {!isEditing ? (
              <Button type="button" onClick={() => setIsEditing(true)} variant="secondary" size="sm">
                <Edit2 className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }} 
                  variant="ghost" 
                  size="sm"
                >
                  <X className="mr-2 h-4 w-4" />
                  Annuler
                </Button>
                <Button type="submit" size="sm" disabled={isSaving || !isDirty}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className={inputClass}
              />
              <p className="text-xs text-slate-500 mt-1">L&apos;email ne peut pas être modifié</p>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">Date de naissance</label>
              <input
                type="date"
                {...register("dob")}
                disabled={!isEditing}
                className={cn(inputClass, errors.dob && "border-rose-400/70")}
              />
              {errors.dob && <p className="text-xs text-rose-300 mt-1">{errors.dob.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">Prénom *</label>
              <input
                type="text"
                {...register("firstName")}
                disabled={!isEditing}
                className={cn(inputClass, errors.firstName && "border-rose-400/70")}
              />
              {errors.firstName && <p className="text-xs text-rose-300 mt-1">{errors.firstName.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">Nom *</label>
              <input
                type="text"
                {...register("lastName")}
                disabled={!isEditing}
                className={cn(inputClass, errors.lastName && "border-rose-400/70")}
              />
              {errors.lastName && <p className="text-xs text-rose-300 mt-1">{errors.lastName.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">École / Université</label>
              <input
                type="text"
                placeholder="HEC, ESCP, Centrale..."
                {...register("school")}
                disabled={!isEditing}
                className={cn(inputClass, errors.school && "border-rose-400/70")}
              />
              {errors.school && <p className="text-xs text-rose-300 mt-1">{errors.school.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-200 mb-2 block">Secteur d&apos;intérêt</label>
              <select
                {...register("sector")}
                disabled={!isEditing}
                className={cn(inputClass, errors.sector && "border-rose-400/70")}
              >
                <option value="">Sélectionner</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>
                    {sector}
                  </option>
                ))}
              </select>
              {errors.sector && <p className="text-xs text-rose-300 mt-1">{errors.sector.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-200 mb-2 block">Profil LinkedIn</label>
              <input
                type="url"
                placeholder="https://www.linkedin.com/in/..."
                {...register("linkedinUrl")}
                disabled={!isEditing}
                className={cn(inputClass, errors.linkedinUrl && "border-rose-400/70")}
              />
              {errors.linkedinUrl && <p className="text-xs text-rose-300 mt-1">{errors.linkedinUrl.message}</p>}
            </div>
          </div>
        </BentoCard>

        {/* CV Section */}
        <BentoCard padding="lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
              <FileText className="h-5 w-5 text-emerald-200" />
            </div>
            <h2 className="text-xl font-semibold text-slate-100">Curriculum Vitae</h2>
          </div>

          {profile?.cvPath ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-950/40 border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                    <FileText className="h-6 w-6 text-emerald-200" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-100">CV_{profile.firstName}_{profile.lastName}.pdf</p>
                    <p className="text-xs text-slate-400">Dernière modification : {new Date().toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button" 
                  onClick={handleCVPreview} 
                  variant="secondary" 
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Aperçu rapide
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCVDownload} 
                  variant="secondary" 
                  size="sm"
                  className="flex-1 sm:flex-none"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  asChild
                  className="flex-1 sm:flex-none"
                >
                  <label className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    {isUploadingCV ? "Upload..." : "Remplacer"}
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleCVUpload}
                      className="hidden"
                      disabled={isUploadingCV}
                    />
                  </label>
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCVDelete}
                  variant="secondary"
                  size="sm"
                  disabled={isDeletingCV}
                  className="flex-1 sm:flex-none text-rose-300 hover:text-rose-200 hover:bg-rose-500/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isDeletingCV ? "Suppression..." : "Supprimer"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-white/10 rounded-lg">
              <FileText className="h-12 w-12 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400 mb-4">Aucun CV uploadé</p>
              <Button type="button" variant="secondary" asChild disabled={isUploadingCV}>
                <label className="cursor-pointer">
                  <Upload className="mr-2 h-4 w-4" />
                  {isUploadingCV ? "Upload en cours..." : "Uploader mon CV"}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleCVUpload}
                    className="hidden"
                    disabled={isUploadingCV}
                  />
                </label>
              </Button>
              <p className="text-xs text-slate-500 mt-2">Format PDF uniquement, max 5 Mo</p>
            </div>
          )}
        </BentoCard>
      </form>

      {/* Modal d'aperçu du CV */}
      {showCVPreview && cvPreviewUrl && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={handleCloseCVPreview}
        >
          <div 
            className="relative w-full max-w-6xl h-[90vh] bg-slate-900 rounded-xl overflow-hidden border border-white/10 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/50">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-emerald-200" />
                <h3 className="text-lg font-semibold text-slate-100">
                  Aperçu du CV - {profile?.firstName} {profile?.lastName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleCVDownload}
                  variant="secondary"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger
                </Button>
                <Button
                  onClick={handleCloseCVPreview}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Visionneuse PDF */}
            <div className="h-[calc(100%-4rem)] w-full">
              <iframe
                src={cvPreviewUrl}
                className="w-full h-full"
                title="CV Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
