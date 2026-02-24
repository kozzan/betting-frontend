"use client";

import useSWR from "swr";
import type { ApiResponse } from "@/types/markets";
import type { PriceAlert, AlertDirection } from "@/types/alert";

async function alertsFetcher(url: string): Promise<PriceAlert[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load alerts: ${res.status}`);
  const json: ApiResponse<PriceAlert[]> = await res.json();
  return json.data;
}

interface CreateAlertInput {
  marketId: string;
  thresholdCents: number;
  direction: AlertDirection;
}

interface UseAlertsReturn {
  alerts: PriceAlert[];
  isLoading: boolean;
  error: Error | undefined;
  createAlert: (input: CreateAlertInput) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
}

export function useAlerts(): UseAlertsReturn {
  const { data, error, isLoading, mutate } = useSWR<PriceAlert[]>(
    "/api/alerts",
    alertsFetcher,
    { revalidateOnFocus: false }
  );

  const alerts = data ?? [];

  async function createAlert(input: CreateAlertInput): Promise<void> {
    const res = await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      let message = `Error ${res.status}`;
      try {
        const err = await res.json();
        message = err?.message ?? err?.error ?? message;
      } catch {
        // ignore parse error
      }
      throw new Error(message);
    }
    await mutate();
  }

  async function deleteAlert(id: string): Promise<void> {
    const optimistic = alerts.filter((a) => a.id !== id);
    await mutate(
      async () => {
        const res = await fetch(`/api/alerts/${id}`, { method: "DELETE" });
        if (!res.ok) {
          let message = `Error ${res.status}`;
          try {
            const err = await res.json();
            message = err?.message ?? err?.error ?? message;
          } catch {
            // ignore parse error
          }
          throw new Error(message);
        }
        return optimistic;
      },
      {
        optimisticData: optimistic,
        revalidate: true,
        rollbackOnError: true,
      }
    );
  }

  return { alerts, isLoading, error, createAlert, deleteAlert };
}
