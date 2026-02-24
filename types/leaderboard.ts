export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  pnlCents: number;
  tradeCount: number;
  winRate: number;
}

export type LeaderboardPeriod = "7d" | "30d" | "all-time";
