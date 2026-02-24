"use client";

import useSWR from "swr";
import type { ActivityEvent } from "@/types/activity";

async function fetcher(url: string): Promise<ActivityEvent[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Activity feed fetch failed: ${res.status}`);
  return res.json() as Promise<ActivityEvent[]>;
}

export function useActivityFeed(limit = 20) {
  const { data, error, isLoading } = useSWR<ActivityEvent[]>(
    `/api/activity-feed?limit=${limit}`,
    fetcher,
    {
      refreshInterval: 10_000,
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
    }
  );

  return {
    events: data ?? [],
    isLoading,
    error: error instanceof Error ? error.message : null,
  };
}
