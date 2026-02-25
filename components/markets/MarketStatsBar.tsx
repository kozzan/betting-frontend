"use client";

import useSWR from "swr";
import type { ApiResponse, MarketStats } from "@/types/markets";

interface MarketStatsBarProps {
  readonly marketId: string;
}

async function statsFetcher(url: string): Promise<MarketStats> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load stats");
  const json: ApiResponse<MarketStats> = await res.json();
  return json.data;
}

function formatCents(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(1)}K`;
  return `$${dollars.toFixed(0)}`;
}

interface StatItemProps {
  readonly label: string;
  readonly value: string;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="px-4 py-3 text-center">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}

export function MarketStatsBar({ marketId }: MarketStatsBarProps) {
  const { data, isLoading } = useSWR<MarketStats>(
    `/api/markets/${marketId}/stats`,
    statsFetcher,
    { refreshInterval: 30_000 }
  );

  if (isLoading || !data) {
    return (
      <div className="rounded-md border border-border bg-card grid grid-cols-4 divide-x divide-border animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3 text-center">
            <div className="h-3 w-16 mx-auto rounded bg-muted mb-1.5" />
            <div className="h-4 w-12 mx-auto rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card grid grid-cols-4 divide-x divide-border">
      <StatItem label="24h Volume" value={formatCents(data.volume24hCents)} />
      <StatItem label="Open Interest" value={formatCents(data.openInterestCents)} />
      <StatItem label="Probability" value={`${data.yesProbabilityPct}%`} />
      <StatItem label="Traders" value={data.numTraders.toLocaleString()} />
    </div>
  );
}
