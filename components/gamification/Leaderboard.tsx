"use client";

import { useEffect, useState } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { Medal } from "lucide-react";
import { getGlobalLeaderboard } from "@/lib/gamification/challenges";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LeaderboardEntry } from "@/lib/gamification/types";

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const data = await getGlobalLeaderboard(5);
      setLeaderboard(data);
      setLoading(false);
    };

    loadLeaderboard();
  }, []);

  if (loading) {
    return (
      <BentoCard padding="md" className="space-y-4">
        <div className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-slate-100">Leaderboard</h2>
        </div>
        <p className="text-xs text-slate-500 text-center py-4">Loading...</p>
      </BentoCard>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <BentoCard padding="md" className="space-y-4">
        <div className="flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg font-semibold text-slate-100">Leaderboard</h2>
        </div>
        <p className="text-xs text-slate-400 text-center py-4">
          No completed challenges yet. Be the first! 🚀
        </p>
      </BentoCard>
    );
  }

  return (
    <BentoCard padding="md" className="space-y-4">
      <div className="flex items-center gap-2">
        <Medal className="h-5 w-5 text-amber-400" />
        <h2 className="text-lg font-semibold text-slate-100">Leaderboard</h2>
      </div>
      
      <div className="space-y-2">
        {leaderboard.map((entry) => {
          const isCurrentUser = entry.user_id === currentUserId;
          return (
            <div 
              key={entry.user_id}
              className={`flex items-center justify-between p-2 rounded-lg text-sm ${
                isCurrentUser 
                  ? "bg-emerald-500/10 border border-emerald-500/30" 
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-6 text-center font-mono font-bold ${
                  entry.rank === 1 ? "text-amber-400" :
                  entry.rank === 2 ? "text-slate-300" :
                  entry.rank === 3 ? "text-amber-700" :
                  "text-slate-500"
                }`}>
                  #{entry.rank}
                </span>
                <span className={isCurrentUser ? "text-emerald-300 font-medium" : "text-slate-200"}>
                  {isCurrentUser ? "You" : `User ${entry.user_id.slice(0, 8)}`}
                </span>
              </div>
              <span className="text-slate-400 font-mono">{entry.score?.toFixed(0) || 0} pts</span>
            </div>
          );
        })}
      </div>
      
      <div className="pt-2 border-t border-white/5 text-center">
        <p className="text-xs text-slate-500">Top performers</p>
      </div>
    </BentoCard>
  );
}
