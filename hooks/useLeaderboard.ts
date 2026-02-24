"use client";

import useSWR from "swr";
import type { LeaderboardEntry, LeaderboardPeriod } from "@/types/leaderboard";

async function fetcher(url: string): Promise<LeaderboardEntry[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
  return res.json() as Promise<LeaderboardEntry[]>;
}

export function useLeaderboard(period: LeaderboardPeriod) {
  const { data, error, isLoading } = useSWR<LeaderboardEntry[]>(
    `/api/leaderboard?period=${period}&page=0&size=50`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60_000,
    }
  );

  return {
    entries: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
