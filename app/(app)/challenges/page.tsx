"use client";

import { useState, useEffect } from "react";
import { BentoCard } from "@/components/ui/bento-card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Lock, CheckCircle, ArrowRight, Calendar } from "lucide-react";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { getActiveChallenges, joinChallenge, getChallengeParticipation } from "@/lib/gamification/challenges";
import type { ChallengeWithParticipation } from "@/lib/gamification/types";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeWithParticipation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const activeChallenges = await getActiveChallenges();
      
      // Load participation status for each challenge
      if (user) {
        const challengesWithParticipation = await Promise.all(
          activeChallenges.map(async (challenge) => {
            const participation = await getChallengeParticipation(challenge.id, user.id);
            return {
              ...challenge,
              participation,
            };
          })
        );
        setChallenges(challengesWithParticipation);
      } else {
        setChallenges(activeChallenges);
      }
      
      setLoading(false);
    };

    loadData();
  }, []);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
      toast.success("Successfully joined the challenge!");
      
      // Refresh challenges
      const activeChallenges = await getActiveChallenges();
      if (userId) {
        const challengesWithParticipation = await Promise.all(
          activeChallenges.map(async (challenge) => {
            const participation = await getChallengeParticipation(challenge.id, userId);
            return {
              ...challenge,
              participation,
            };
          })
        );
        setChallenges(challengesWithParticipation);
      }
    } catch (error) {
      console.error("Error joining challenge:", error);
      toast.error("Failed to join challenge. You may have already joined.");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 lg:p-10 flex items-center justify-center">
        <p className="text-slate-400">Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 lg:p-10 space-y-8">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border border-emerald-500/20 p-8 lg:p-12">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
            <Trophy className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">Partenariats Exclusifs</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-100 mb-4">
            Prouvez vos compétences,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              Démarquez-vous des 99.99%
            </span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mb-8">
            Les meilleurs candidats (top 0.01%) reçoivent des opportunités uniques : 
            entretiens fast-track, mentorat 1-on-1, et accès privilégié aux équipes de 
            <span className="font-semibold text-blue-600"> Goldman Sachs</span>,
            <span className="font-semibold text-blue-500"> JP Morgan</span>, et 
            <span className="font-semibold text-red-600"> Bank of America</span>.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <Users className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-slate-100">{challenges.reduce((acc, c) => acc + (c.participant_count || 0), 0)}</p>
                <p className="text-xs text-slate-400">Participants actifs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50">
              <Trophy className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-slate-100">{challenges.length}</p>
                <p className="text-xs text-slate-400">Challenges actifs</p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content: Challenges List */}
        <div className="flex-1 space-y-6">

          <div className="grid grid-cols-1 gap-4">
            {challenges.map((challenge) => {
              const isJoined = !!challenge.participation;
              const isCompleted = challenge.participation?.status === "completed";
              const endsIn = challenge.ends_at ? formatDate(challenge.ends_at) : null;

              return (
                <BentoCard key={challenge.id} padding="lg" className="group relative overflow-hidden transition-all hover:border-emerald-500/50">
                  <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center z-10 relative">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-semibold text-slate-100">{challenge.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                          challenge.difficulty === 'Hard' ? 'border-rose-500/30 text-rose-400 bg-rose-500/10' :
                          challenge.difficulty === 'Medium' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' :
                          'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        }`}>
                          {challenge.difficulty}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-emerald-400 text-xs">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </span>
                        )}
                        {isJoined && !isCompleted && (
                          <span className="flex items-center gap-1 text-blue-400 text-xs">
                            In Progress
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-sm max-w-xl">{challenge.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {challenge.participant_count || 0} participants
                        </span>
                        {endsIn && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Ends {endsIn}
                            </span>
                          </>
                        )}
                        <span className="text-slate-600">•</span>
                        <span className="text-indigo-400 font-medium">{challenge.company}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-wider">Reward</p>
                        <p className="text-sm font-medium text-amber-300 flex items-center gap-1 justify-end">
                          <Trophy className="h-3 w-3" /> {challenge.reward_description}
                        </p>
                      </div>
                      
                      {!userId ? (
                        <Button variant="outline" disabled className="w-full opacity-50">
                          <Lock className="h-4 w-4 mr-2" /> Sign in to join
                        </Button>
                      ) : isCompleted ? (
                        <Button variant="outline" className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300">
                          View Results
                        </Button>
                      ) : isJoined ? (
                        <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                          Continue Challenge <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button 
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                          onClick={() => handleJoinChallenge(challenge.id)}
                        >
                          Start Challenge <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-2xl group-hover:from-emerald-500/20 transition-all" />
                </BentoCard>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Stats & Leaderboard */}
        <div className="w-full lg:w-80 space-y-6">
          <StreakCounter />
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}
