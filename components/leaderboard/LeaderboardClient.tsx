"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeaderboardTable, LeaderboardTableSkeleton } from "./LeaderboardTable";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import type { LeaderboardPeriod } from "@/types/leaderboard";

const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all-time", label: "All Time" },
];

interface LeaderboardClientProps {
  readonly currentUserId?: string;
}

export function LeaderboardClient({ currentUserId }: LeaderboardClientProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("7d");
  const { entries, isLoading, error } = useLeaderboard(period);

  return (
    <div className="space-y-4">
      <Tabs value={period} onValueChange={(v) => setPeriod(v as LeaderboardPeriod)}>
        <TabsList>
          {PERIODS.map((p) => (
            <TabsTrigger key={p.value} value={p.value}>
              {p.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {isLoading ? (
        <LeaderboardTableSkeleton />
      ) : (
        <LeaderboardTable entries={entries} currentUserId={currentUserId} />
      )}
    </div>
  );
}
