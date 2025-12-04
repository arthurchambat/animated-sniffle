import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Challenge, ChallengeParticipant, ChallengeWithParticipation, LeaderboardEntry } from "./types";

/**
 * Get all active challenges
 */
export async function getActiveChallenges(): Promise<ChallengeWithParticipation[]> {
  const supabase = createSupabaseBrowserClient();

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching challenges:", error);
    return [];
  }

  // Get participation count for each challenge
  const challengesWithCounts = await Promise.all(
    (challenges || []).map(async (challenge) => {
      const { count } = await supabase
        .from("challenge_participants")
        .select("*", { count: "exact", head: true })
        .eq("challenge_id", challenge.id);

      return {
        ...challenge,
        participant_count: count || 0,
      };
    })
  );

  return challengesWithCounts;
}

/**
 * Get user's participation in a challenge
 */
export async function getChallengeParticipation(
  challengeId: string,
  userId: string
): Promise<ChallengeParticipant | null> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("challenge_participants")
    .select("*")
    .eq("challenge_id", challengeId)
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching participation:", error);
    return null;
  }

  return data;
}

/**
 * Join a challenge
 */
export async function joinChallenge(challengeId: string): Promise<ChallengeParticipant | null> {
  const supabase = createSupabaseBrowserClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("challenge_participants")
    .insert({
      challenge_id: challengeId,
      user_id: user.id,
      status: "in_progress",
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining challenge:", error);
    throw error;
  }

  return data;
}

/**
 * Update challenge participation (submit score)
 */
export async function updateChallengeParticipation(
  participationId: string,
  updates: {
    status?: "completed" | "abandoned";
    score?: number;
    time_taken_seconds?: number;
  }
): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const updateData: any = { ...updates };
  if (updates.status === "completed") {
    updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("challenge_participants")
    .update(updateData)
    .eq("id", participationId);

  if (error) {
    console.error("Error updating participation:", error);
    throw error;
  }
}

/**
 * Get leaderboard for a challenge
 */
export async function getChallengeLeaderboard(
  challengeId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("challenge_participants")
    .select(`
      user_id,
      score,
      time_taken_seconds,
      completed_at
    `)
    .eq("challenge_id", challengeId)
    .eq("status", "completed")
    .order("score", { ascending: false })
    .order("time_taken_seconds", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }

  // Add rank
  return (data || []).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}

/**
 * Get global leaderboard (top performers across all challenges)
 */
export async function getGlobalLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("challenge_participants")
    .select(`
      user_id,
      score,
      completed_at
    `)
    .eq("status", "completed")
    .order("score", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching global leaderboard:", error);
    return [];
  }

  return (data || []).map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));
}
