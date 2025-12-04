"use client";

import { useEffect, useState } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { Flame } from "lucide-react";
import { getUserStreak, logDailyActivity } from "@/lib/gamification/streaks";
import type { UserStreak } from "@/lib/gamification/types";

export function StreakCounter() {
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStreak = async () => {
      // Log today's activity (this will update the streak)
      await logDailyActivity("page_view");
      
      // Fetch updated streak
      const streakData = await getUserStreak();
      setStreak(streakData);
      setLoading(false);
    };

    loadStreak();
  }, []);

  if (loading) {
    return (
      <BentoCard padding="md" className="bg-gradient-to-br from-orange-500/10 to-rose-500/5 border-orange-500/20">
        <div className="flex items-center justify-center h-20">
          <p className="text-xs text-orange-300/70">Loading streak...</p>
        </div>
      </BentoCard>
    );
  }

  const currentStreak = streak?.current_streak || 0;
  const bestStreak = streak?.longest_streak || 0;

  return (
    <BentoCard padding="md" className="bg-gradient-to-br from-orange-500/10 to-rose-500/5 border-orange-500/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-orange-300 font-medium uppercase tracking-wider">Daily Streak</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-orange-100">{currentStreak}</span>
            <span className="text-sm text-orange-300/70">days</span>
          </div>
        </div>
        <div className={`h-12 w-12 rounded-full bg-orange-500/20 flex items-center justify-center ${currentStreak > 0 ? 'animate-pulse' : ''}`}>
          <Flame className="h-6 w-6 text-orange-400" fill={currentStreak > 0 ? "currentColor" : "none"} />
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-orange-500/20 flex justify-between text-xs">
        <span className="text-slate-400">Best: <span className="text-slate-200">{bestStreak} days</span></span>
        {currentStreak > 0 ? (
          <span className="text-orange-300">Keep it up! 🔥</span>
        ) : (
          <span className="text-slate-400">Start your streak today!</span>
        )}
      </div>
    </BentoCard>
  );
}
