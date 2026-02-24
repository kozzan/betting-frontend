"use client";

import useSWR from "swr";
import type { ApiResponse, MarketSummary } from "@/types/markets";

interface WatchlistResponse {
  markets: MarketSummary[];
}

async function watchlistFetcher(url: string): Promise<MarketSummary[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Watchlist fetch failed: ${res.status}`);
  const json: ApiResponse<WatchlistResponse> = await res.json();
  // Backend may return data as an array directly or wrapped
  const data = json.data;
  if (Array.isArray(data)) return data as unknown as MarketSummary[];
  return data.markets ?? [];
}

interface UseWatchlistReturn {
  watchlist: MarketSummary[];
  isLoading: boolean;
  error: Error | undefined;
  isWatched: (marketId: string) => boolean;
  addToWatchlist: (marketId: string) => Promise<void>;
  removeFromWatchlist: (marketId: string) => Promise<void>;
}

export function useWatchlist(): UseWatchlistReturn {
  const { data, error, isLoading, mutate } = useSWR<MarketSummary[]>(
    "/api/watchlist",
    watchlistFetcher,
    { revalidateOnFocus: false }
  );

  const watchlist = data ?? [];

  function isWatched(marketId: string): boolean {
    return watchlist.some((m) => m.id === marketId);
  }

  async function addToWatchlist(marketId: string): Promise<void> {
    // Optimistic update
    const current = watchlist;
    await mutate(
      async () => {
        const res = await fetch(`/api/watchlist/${marketId}`, { method: "POST" });
        if (!res.ok) throw new Error("Failed to add to watchlist");
        return current; // refetch will correct the list
      },
      {
        optimisticData: current,
        revalidate: true,
        rollbackOnError: true,
      }
    );
  }

  async function removeFromWatchlist(marketId: string): Promise<void> {
    const optimistic = watchlist.filter((m) => m.id !== marketId);
    await mutate(
      async () => {
        const res = await fetch(`/api/watchlist/${marketId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to remove from watchlist");
        return optimistic;
      },
      {
        optimisticData: optimistic,
        revalidate: true,
        rollbackOnError: true,
      }
    );
  }

  return {
    watchlist,
    isLoading,
    error,
    isWatched,
    addToWatchlist,
    removeFromWatchlist,
  };
}
