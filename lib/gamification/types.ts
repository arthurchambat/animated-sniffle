export interface Challenge {
  id: string;
  title: string;
  description: string;
  company: "JPMorgan" | "Bank of America" | "Goldman Sachs" | "Morgan Stanley";
  difficulty: "Easy" | "Medium" | "Hard";
  reward: string;
  status: "locked" | "available" | "completed";
  participants: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export interface UserStreak {
  currentStreak: number;
  lastLoginDate: string;
  bestStreak: number;
}
