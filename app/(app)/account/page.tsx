'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { ProfileForm } from "@/components/account/ProfileForm";
import { CvManager } from "@/components/account/CvManager";
import { PaymentsCard, type BillingData } from "@/components/account/PaymentsCard";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentProfile, type ProfileRow } from "@/lib/supabase/profile";

export default function AccountPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [tokensMinutes, setTokensMinutes] = useState(150); // Mock: 2h30 de tokens disponibles

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
      } catch (error) {
        console.error("[FinanceBro] Unable to load profile", error);
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

  const handleProfileChange = (updated: ProfileRow) => {
    setProfile(updated);
  };

  const handleCvChange = (updated: ProfileRow) => {
    setProfile(updated);
  };

  const handleSaveBilling = (data: BillingData) => {
    console.log('[Account] Billing data to save:', data);
    toast.success('Informations de facturation enregistrées (stub)');
  };

  const handleSelectPackage = (planId: string) => {
    console.log('[Account] Package selected:', planId);
    toast.success(`Package ${planId} sélectionné (stub - Stripe à venir)`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-400">Chargement du compte…</p>
      </div>
    );
  }

  if (!userId || !profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-400">
          Nous n&apos;avons pas pu récupérer ton compte. Réessaie plus tard.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Mon compte"
        subtitle="Gère tes informations personnelles et ton CV pour personnaliser tes sessions."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ProfileForm userId={userId} profile={profile} onProfileChange={handleProfileChange} />
        <div className="space-y-6">
          <CvManager userId={userId} profile={profile} onProfileChange={handleCvChange} />
          <PaymentsCard
            tokensMinutes={tokensMinutes}
            onSaveBilling={handleSaveBilling}
            onSelectPackage={handleSelectPackage}
          />
        </div>
      </div>
    </div>
  );
}
