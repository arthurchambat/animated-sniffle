# 💻 Exemples d'Utilisation - API & Components

## 🎯 Gamification - Challenges

### Récupérer tous les challenges actifs
```typescript
import { getActiveChallenges } from "@/lib/gamification/challenges";

const challenges = await getActiveChallenges();
// Returns: ChallengeWithParticipation[]
```

### Rejoindre un challenge
```typescript
import { joinChallenge } from "@/lib/gamification/challenges";

try {
  const participation = await joinChallenge(challengeId);
  console.log("Challenge joined:", participation.id);
} catch (error) {
  // User already joined or challenge not found
}
```

### Soumettre un score
```typescript
import { updateChallengeParticipation } from "@/lib/gamification/challenges";

await updateChallengeParticipation(participationId, {
  status: "completed",
  score: 85.5,
  time_taken_seconds: 1800, // 30 minutes
});
```

### Obtenir le leaderboard
```typescript
import { getChallengeLeaderboard } from "@/lib/gamification/challenges";

const leaderboard = await getChallengeLeaderboard(challengeId, 10);
// Returns top 10 entries with rank, score, user_id
```

---

## 🔥 Gamification - Streaks

### Récupérer le streak de l'utilisateur
```typescript
import { getUserStreak } from "@/lib/gamification/streaks";

const streak = await getUserStreak();
console.log(`Current streak: ${streak?.current_streak || 0} days`);
console.log(`Best streak: ${streak?.longest_streak || 0} days`);
```

### Logger une activité (met à jour automatiquement le streak)
```typescript
import { logDailyActivity } from "@/lib/gamification/streaks";

// Log different types of activities
await logDailyActivity("interview_completed");
await logDailyActivity("challenge_joined");
await logDailyActivity("page_visit");
```

### Obtenir le top des streaks
```typescript
import { getTopStreaks } from "@/lib/gamification/streaks";

const topStreaks = await getTopStreaks(5);
// Returns top 5 users with highest current streaks
```

---

## 🤖 Avatar BeyondPresence

### Créer une session avatar
```typescript
import { createBeyondPresenceSession } from "@/lib/bey";

const session = await createBeyondPresenceSession({
  sessionId: interviewId,
  persona: "You are a finance interviewer specializing in investment banking.",
  locale: "en-US",
});

console.log("Avatar session:", session.sessionId);
console.log("LiveKit details:", session.livekit);
```

### Obtenir un token LiveKit
```typescript
const response = await fetch(
  `/api/livekit/token?room=${roomId}&username=${userName}`
);
const { token } = await response.json();
```

---

## 🎨 Components

### Afficher le compteur de streaks
```tsx
import { StreakCounter } from "@/components/gamification/StreakCounter";

export default function MyPage() {
  return (
    <div>
      <StreakCounter />
    </div>
  );
}
```

### Afficher le leaderboard
```tsx
import { Leaderboard } from "@/components/gamification/Leaderboard";

export default function MyPage() {
  return (
    <div>
      <Leaderboard />
    </div>
  );
}
```

### Tracker automatiquement l'activité utilisateur
```tsx
// Dans un layout ou une page client
"use client";

import { useActivityTracker } from "@/lib/gamification/useActivityTracker";

export default function MyLayout({ children }) {
  useActivityTracker(); // Auto-log activity on mount
  
  return <div>{children}</div>;
}
```

---

## 🎥 Interview avec Avatar

### Client LiveKit avec avatar
```tsx
import { LiveInterviewClient } from "@/components/interview/LiveInterviewClient";

export default function InterviewPage({ session, user }) {
  return (
    <LiveInterviewClient 
      session={session}
      userName={user.name}
    />
  );
}
```

### Afficher seulement le player vidéo
```tsx
import { InterviewPlayer } from "@/components/interview/InterviewPlayer";

export default function VideoView({ userName }) {
  return (
    <InterviewPlayer userName={userName} />
  );
}
```

---

## 🗄️ Requêtes Supabase Directes

### Créer un nouveau challenge (Admin)
```typescript
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const supabase = createSupabaseBrowserClient();

const { data, error } = await supabase
  .from("challenges")
  .insert({
    company: "McKinsey",
    title: "Case Study Challenge",
    description: "Solve a business case in 45 minutes",
    difficulty: "Hard",
    reward_type: "interview",
    reward_description: "Final round interview with McKinsey",
    is_active: true,
    ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  })
  .select()
  .single();
```

### Vérifier si l'utilisateur a déjà participé
```typescript
const { data: participation } = await supabase
  .from("challenge_participants")
  .select("*")
  .eq("challenge_id", challengeId)
  .eq("user_id", userId)
  .maybeSingle();

if (participation) {
  console.log("Already joined");
}
```

### Obtenir le rang de l'utilisateur dans un challenge
```typescript
const { data: rank } = await supabase
  .rpc("get_challenge_rank", {
    challenge_uuid: challengeId,
    user_uuid: userId,
  });

console.log(`You are ranked #${rank}`);
```

### Logger manuellement une activité (depuis le client)
```typescript
const { error } = await supabase.rpc("log_user_activity", {
  activity_type_param: "custom_event",
});
```

---

## 🔄 Webhooks & Events

### Écouter les changements de challenges en temps réel
```typescript
const supabase = createSupabaseBrowserClient();

const channel = supabase
  .channel("challenges-changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "challenges",
    },
    (payload) => {
      console.log("Challenge updated:", payload.new);
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

### Écouter les nouvelles participations
```typescript
const channel = supabase
  .channel("leaderboard-updates")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "challenge_participants",
      filter: `challenge_id=eq.${challengeId}`,
    },
    (payload) => {
      console.log("New participant:", payload.new);
      // Refresh leaderboard
    }
  )
  .subscribe();
```

---

## 🎮 Use Cases Avancés

### Créer un challenge temporaire
```typescript
// Challenge qui dure 7 jours
const sevenDaysFromNow = new Date();
sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

await supabase.from("challenges").insert({
  company: "Startup X",
  title: "Weekend Challenge",
  description: "Build a pitch deck over the weekend",
  difficulty: "Medium",
  reward_type: "networking_event",
  reward_description: "Pitch to investors at our Demo Day",
  starts_at: new Date().toISOString(),
  ends_at: sevenDaysFromNow.toISOString(),
  is_active: true,
  max_participants: 50, // Limité à 50 personnes
});
```

### Système de bonus pour les streaks
```typescript
import { getUserStreak } from "@/lib/gamification/streaks";

const streak = await getUserStreak();
const bonusMultiplier = Math.min(1 + (streak.current_streak * 0.1), 2.0);

// Le score est multiplié par le bonus
const finalScore = baseScore * bonusMultiplier;

console.log(`Your ${streak.current_streak}-day streak gives you a ${bonusMultiplier}x bonus!`);
```

### Détecter les abandons de challenge
```typescript
// Trouver les participations inactives depuis plus de 7 jours
const { data: inactive } = await supabase
  .from("challenge_participants")
  .select("*")
  .eq("status", "in_progress")
  .lt("started_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

// Marquer comme abandonné
for (const participation of inactive || []) {
  await supabase
    .from("challenge_participants")
    .update({ status: "abandoned" })
    .eq("id", participation.id);
}
```

---

## 🧪 Tests & Debugging

### Forcer un streak pour tester
```sql
-- Dans Supabase SQL Editor
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date, total_days_active)
VALUES ('YOUR_USER_ID', 10, 15, CURRENT_DATE, 25)
ON CONFLICT (user_id) DO UPDATE
SET current_streak = 10, longest_streak = 15, last_activity_date = CURRENT_DATE;
```

### Simuler une participation complète
```typescript
const { data: participation } = await supabase
  .from("challenge_participants")
  .insert({
    challenge_id: challengeId,
    user_id: userId,
    status: "completed",
    score: 92.5,
    time_taken_seconds: 2400,
    completed_at: new Date().toISOString(),
  })
  .select()
  .single();
```

### Vérifier le trigger de streak
```sql
-- Insérer une activité pour hier
INSERT INTO daily_activity_log (user_id, activity_date, activity_type)
VALUES ('YOUR_USER_ID', CURRENT_DATE - INTERVAL '1 day', 'test');

-- Insérer une activité pour aujourd'hui
INSERT INTO daily_activity_log (user_id, activity_date, activity_type)
VALUES ('YOUR_USER_ID', CURRENT_DATE, 'test');

-- Vérifier que le streak a augmenté
SELECT * FROM user_streaks WHERE user_id = 'YOUR_USER_ID';
```

---

## 🚀 Performance Tips

### Utiliser le cache pour les leaderboards
```typescript
import { cache } from "react";

export const getCachedLeaderboard = cache(async (challengeId: string) => {
  return await getChallengeLeaderboard(challengeId, 10);
});

// Usage dans Server Component
const leaderboard = await getCachedLeaderboard(challengeId);
```

### Pagination pour les challenges
```typescript
const PAGE_SIZE = 10;

const { data: challenges, count } = await supabase
  .from("challenges")
  .select("*", { count: "exact" })
  .eq("is_active", true)
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

const totalPages = Math.ceil((count || 0) / PAGE_SIZE);
```

### Optimiser les requêtes de participation
```typescript
// Charger tout en une requête avec JOIN
const { data } = await supabase
  .from("challenges")
  .select(`
    *,
    participation:challenge_participants!inner(*)
  `)
  .eq("is_active", true)
  .eq("challenge_participants.user_id", userId);
```

---

**Consultez aussi :**
- `QUICKSTART.md` - Guide de démarrage rapide
- `SETUP_AVATAR_CHALLENGES.md` - Documentation technique complète
- `CHANGELOG_AVATAR_CHALLENGES.md` - Résumé des modifications
