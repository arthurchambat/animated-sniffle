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
  role_interest: string | null;
  cv_path: string | null;
}

const PROFILE_COLUMNS =
  "id, email, first_name, last_name, dob, school, linkedin_url, sector, referral, role_interest, cv_path";

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
    role_interest: metadata.role_interest ?? null,
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
    role_interest: values.role_interest !== undefined ? values.role_interest : currentProfile?.role_interest ?? null,
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
    role_interest: currentProfile?.role_interest ?? null,
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

export const ROLE_INTEREST_OPTIONS = [
  "Analyste",
  "Associate",
  "Vice President",
  "Director",
  "Managing Director",
  "Autre"
] as const;

/**
 * Serialize an array of strings to a comma-separated string for database storage.
 */
export function serializeArray(arr: string[]): string {
  return arr.filter(Boolean).join(',');
}

/**
 * Deserialize a comma-separated string to an array of strings.
 */
export function deserializeArray(str: string | null): string[] {
  return str ? str.split(',').filter(Boolean) : [];
}

/**
 * Check if a profile has completed the required onboarding fields
 * (sector, referral, role_interest are required; cv_path is optional)
 */
export function isProfileComplete(profile: ProfileRow | null): boolean {
  if (!profile) return false;
  return !!(profile.sector && profile.referral && profile.role_interest);
}

/**
 * Update onboarding-specific profile fields
 */
export async function upsertOnboardingProfile(
  supabase: SupabaseBrowserClient,
  userId: string,
  values: {
    first_name: string;
    last_name: string;
    dob?: string | null;
    sector: string;
    referral: string;
    role_interest: string;
    cv_path?: string | null;
  },
  currentProfile?: ProfileRow | null
) {
  const payload: ProfileRow = {
    id: userId,
    email: currentProfile?.email ?? null,
    first_name: values.first_name,
    last_name: values.last_name,
    dob: values.dob ?? currentProfile?.dob ?? null,
    school: currentProfile?.school ?? null,
    linkedin_url: currentProfile?.linkedin_url ?? null,
    sector: values.sector,
    referral: values.referral,
    role_interest: values.role_interest,
    cv_path: values.cv_path ?? currentProfile?.cv_path ?? null
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

/**
 * Get current user's profile (alias for getCurrentProfile for consistency)
 */
export async function getProfile(supabase: SupabaseBrowserClient, userId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  if (!profile) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) {
      return buildFallbackProfile(user);
    }
  }

  return profile;
}

/**
 * Replace CV file in storage and update profile cv_path
 */
export async function replaceCv(
  supabase: SupabaseBrowserClient,
  userId: string,
  file: File,
  currentProfile?: ProfileRow | null
): Promise<{ profile: ProfileRow; cvPath: string }> {
  const CV_BUCKET = "cvs";
  const targetPath = `${userId}/cv.pdf`;

  // Remove old CV if exists
  if (currentProfile?.cv_path) {
    await supabase.storage.from(CV_BUCKET).remove([currentProfile.cv_path]);
  }

  // Upload new CV
  const { error: uploadError } = await supabase.storage.from(CV_BUCKET).upload(targetPath, file, {
    cacheControl: "0",
    upsert: true,
    contentType: "application/pdf"
  });

  if (uploadError) {
    throw uploadError;
  }

  // Update profile with new cv_path
  const updatedProfile = await updateProfileCvPath(supabase, userId, targetPath, currentProfile);

  return { profile: updatedProfile, cvPath: targetPath };
}
