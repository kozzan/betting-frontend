"use client";

import useSWR from "swr";
import type { OutcomeOrderBook } from "@/types/market-outcome";
import type { ApiResponse } from "@/types/markets";

async function outcomeOrderBookFetcher(url: string): Promise<OutcomeOrderBook> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load outcome order book: ${res.status}`);
  const json: ApiResponse<OutcomeOrderBook> = await res.json();
  return json.data;
}

interface UseOutcomeOrderBookReturn {
  orderBook: OutcomeOrderBook | null;
  isLoading: boolean;
}

export function useOutcomeOrderBook(
  marketId: string,
  outcomeId: string | null
): UseOutcomeOrderBookReturn {
  const key =
    outcomeId
      ? `/api/markets/${marketId}/outcomes/${outcomeId}/orderbook`
      : null;

  const { data, isLoading } = useSWR<OutcomeOrderBook>(
    key,
    outcomeOrderBookFetcher,
    { refreshInterval: 10_000 }
  );

  return {
    orderBook: data ?? null,
    isLoading,
  };
}
