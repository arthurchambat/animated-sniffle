'use client';

import type { User } from "@supabase/supabase-js";
import type { SupabaseBrowserClient } from "@/lib/supabase/client";

export interface ProfileRow {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  dob: string | null;
  school: string | null;
  linkedin_url: string | null;
  sector: string | null;
  referral: string | null;
  cv_path: string | null;
}

const PROFILE_COLUMNS =
  "id, email, first_name, last_name, dob, school, linkedin_url, sector, referral, cv_path";

function buildFallbackProfile(user: User): ProfileRow {
  const metadata = user?.user_metadata ?? {};

  return {
    id: user.id,
    email: user.email ?? null,
    first_name: metadata.first_name ?? metadata.firstName ?? null,
    last_name: metadata.last_name ?? metadata.lastName ?? null,
    dob: metadata.dob ?? metadata.date_of_birth ?? null,
    school: metadata.school ?? null,
    linkedin_url: metadata.linkedin_url ?? metadata.linkedin ?? null,
    sector: metadata.sector ?? null,
    referral: metadata.referral ?? null,
    cv_path: metadata.cv_path ?? null
  };
}

export async function getCurrentProfile(supabase: SupabaseBrowserClient) {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  if (!user) {
    return { user: null, profile: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .maybeSingle();

  if (profileError && profileError.code !== "PGRST116") {
    throw profileError;
  }

  return {
    user,
    profile: profile ?? buildFallbackProfile(user)
  };
}

export async function updateProfile(
  supabase: SupabaseBrowserClient,
  userId: string,
  values: Partial<Omit<ProfileRow, "id" | "email" | "cv_path">>,
  currentProfile?: ProfileRow | null
) {
  const payload: ProfileRow = {
    id: userId,
    email: currentProfile?.email ?? null,
    first_name:
      values.first_name !== undefined ? values.first_name : currentProfile?.first_name ?? null,
    last_name:
      values.last_name !== undefined ? values.last_name : currentProfile?.last_name ?? null,
    dob: values.dob !== undefined ? values.dob : currentProfile?.dob ?? null,
    school: values.school !== undefined ? values.school : currentProfile?.school ?? null,
    linkedin_url:
      values.linkedin_url !== undefined ? values.linkedin_url : currentProfile?.linkedin_url ?? null,
    sector: values.sector !== undefined ? values.sector : currentProfile?.sector ?? null,
    referral: values.referral !== undefined ? values.referral : currentProfile?.referral ?? null,
    cv_path: currentProfile?.cv_path ?? null
  };

  if (!payload.email) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    payload.email = user?.email ?? null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProfileCvPath(
  supabase: SupabaseBrowserClient,
  userId: string,
  cvPath: string | null,
  currentProfile?: ProfileRow | null
) {
  const payload: ProfileRow = {
    id: userId,
    email: currentProfile?.email ?? null,
    first_name: currentProfile?.first_name ?? null,
    last_name: currentProfile?.last_name ?? null,
    dob: currentProfile?.dob ?? null,
    school: currentProfile?.school ?? null,
    linkedin_url: currentProfile?.linkedin_url ?? null,
    sector: currentProfile?.sector ?? null,
    referral: currentProfile?.referral ?? null,
    cv_path: cvPath
  };

  if (!payload.email) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    payload.email = user?.email ?? null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export const SECTOR_OPTIONS = [
  "finance de marché",
  "m&a",
  "private equity",
  "conseil",
  "risk",
  "data",
  "autre"
] as const;

export const REFERRAL_OPTIONS = ["ami", "linkedin", "google", "université", "événement", "autre"] as const;
