import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { UserStreak } from "./types";

/**
 * Get user's streak data
 */
export async function getUserStreak(userId?: string): Promise<UserStreak | null> {
  const supabase = createSupabaseBrowserClient();

  let targetUserId = userId;
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .eq("user_id", targetUserId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching streak:", error);
    return null;
  }

  return data;
}

/**
 * Log daily activity to maintain streak
 */
export async function logDailyActivity(activityType: string = "login"): Promise<void> {
  const supabase = createSupabaseBrowserClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Call the database function to log activity
  const { error } = await supabase.rpc("log_user_activity", {
    activity_type_param: activityType,
  });

  if (error) {
    console.error("Error logging activity:", error);
  }
}

/**
 * Get top streaks (leaderboard)
 */
export async function getTopStreaks(limit = 10): Promise<UserStreak[]> {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("user_streaks")
    .select("*")
    .order("current_streak", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching top streaks:", error);
    return [];
  }

  return data || [];
}
