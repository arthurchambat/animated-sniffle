"use client";

import { useEffect } from "react";
import { logDailyActivity } from "@/lib/gamification/streaks";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Hook to automatically log user activity and maintain streaks
 * Use this in layouts or pages to track user engagement
 */
export function useActivityTracker() {
  useEffect(() => {
    const trackActivity = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Log activity (will trigger streak update via database trigger)
        await logDailyActivity("page_visit");
      }
    };

    trackActivity();
  }, []);
}
