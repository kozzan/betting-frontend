export interface Profile {
  id: string;
  email: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
  publicPnl?: boolean;
}

export interface PublicProfile {
  userId: string;
  username: string;
  memberSince: string;
  tradeCount: number;
  publicPnl: boolean;
  pnlCents?: number;
  winRate?: number;
}
