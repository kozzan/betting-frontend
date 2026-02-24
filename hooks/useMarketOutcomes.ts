"use client";

import useSWR from "swr";
import type { MarketOutcome } from "@/types/market-outcome";
import type { ApiResponse } from "@/types/markets";

async function outcomesFetcher(url: string): Promise<MarketOutcome[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load outcomes: ${res.status}`);
  const json: ApiResponse<MarketOutcome[]> = await res.json();
  return json.data;
}

interface UseMarketOutcomesReturn {
  outcomes: MarketOutcome[];
  isLoading: boolean;
  error: Error | undefined;
}

export function useMarketOutcomes(marketId: string): UseMarketOutcomesReturn {
  const { data, error, isLoading } = useSWR<MarketOutcome[]>(
    `/api/markets/${marketId}/outcomes`,
    outcomesFetcher,
    { revalidateOnFocus: false }
  );

  return {
    outcomes: data ?? [],
    isLoading,
    error,
  };
}
