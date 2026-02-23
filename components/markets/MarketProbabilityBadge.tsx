"use client";

import useSWR from "swr";
import { calcImpliedProbability } from "@/lib/probability";
import type { ApiResponse, OrderBook } from "@/types/markets";

interface MarketProbabilityBadgeProps {
  readonly marketId: string;
}

async function fetcher(url: string): Promise<OrderBook> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load order book");
  const json: ApiResponse<OrderBook> = await res.json();
  return json.data;
}

export function MarketProbabilityBadge({ marketId }: MarketProbabilityBadgeProps) {
  const { data: book } = useSWR(
    `/api/markets/${marketId}/orders`,
    fetcher,
    { refreshInterval: 30_000 }
  );

  const yesPct = book ? calcImpliedProbability(book) : null;

  if (yesPct === null) {
    return <span className="text-muted-foreground text-xs tabular-nums">— %</span>;
  }

  return (
    <div className="flex items-center gap-1.5 text-xs tabular-nums">
      <span className="text-emerald-600 font-medium">{yesPct}%</span>
      <div className="w-12 h-1.5 rounded-full overflow-hidden bg-red-200">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${yesPct}%` }} />
      </div>
      <span className="text-red-600 font-medium">{100 - yesPct}%</span>
    </div>
  );
}
