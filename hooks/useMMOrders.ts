"use client";

import useSWR from "swr";
import { toast } from "sonner";
import type { Order } from "@/types/orders";
import type { ApiResponse, PagedResponse } from "@/types/markets";

async function fetcher(url: string): Promise<Order[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch orders: ${res.status}`);
  const json: ApiResponse<PagedResponse<Order>> = await res.json();
  return json.data.content;
}

export function useMMOrders(marketId: string) {
  const url = `/api/orders?marketId=${encodeURIComponent(marketId)}&status=OPEN&size=100`;

  const { data, isLoading, error, mutate } = useSWR<Order[]>(url, fetcher, {
    refreshInterval: 15_000,
  });

  const orders = data ?? [];

  async function cancelOrder(orderId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const err = await res.json();
          message = err?.message ?? err?.error ?? message;
        } catch {
          // ignore
        }
        toast.error(message);
        return false;
      }
      toast.success("Order cancelled");
      await mutate();
      return true;
    } catch {
      toast.error("Failed to cancel order");
      return false;
    }
  }

  async function cancelAll(): Promise<boolean> {
    try {
      const res = await fetch(`/api/mm/${encodeURIComponent(marketId)}/cancel-all`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const err = await res.json();
          message = err?.message ?? err?.error ?? message;
        } catch {
          // ignore
        }
        toast.error(message);
        return false;
      }
      toast.success("All orders cancelled");
      await mutate();
      return true;
    } catch {
      toast.error("Failed to cancel all orders");
      return false;
    }
  }

  return { orders, isLoading, error, cancelOrder, cancelAll, mutate };
}
