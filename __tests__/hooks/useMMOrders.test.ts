import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { SWRConfig } from "swr";
import React from "react";

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

import { useMMOrders } from "@/hooks/useMMOrders";
import { toast } from "sonner";
import type { Order } from "@/types/orders";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, {
    value: { dedupingInterval: 0, provider: () => new Map() },
    children,
  });

const mockOrder: Order = {
  id: "order-1",
  marketId: "market-1",
  userId: "user-1",
  side: "YES",
  action: "BUY",
  status: "OPEN",
  priceCents: 60,
  quantity: 10,
  filledQuantity: 0,
  remainingQuantity: 10,
  heldAmountCents: 600,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function ordersResponse(orders: Order[]) {
  return new Response(
    JSON.stringify({
      data: {
        content: orders,
        totalElements: orders.length,
        totalPages: 1,
        page: 0,
        size: 100,
      },
      meta: { requestId: "r1", timestamp: "" },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

describe("useMMOrders", () => {
  it("starts in loading state with empty orders", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useMMOrders("market-1"), { wrapper });
    expect(result.current.orders).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("loads orders successfully", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(ordersResponse([mockOrder]));
    const { result } = renderHook(() => useMMOrders("market-1"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].id).toBe("order-1");
  });

  it("cancelOrder calls DELETE and shows success toast", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(ordersResponse([mockOrder]));
    const { result } = renderHook(() => useMMOrders("market-1"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.mocked(global.fetch).mockResolvedValueOnce(ordersResponse([]));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.cancelOrder("order-1");
    });

    expect(success).toBe(true);
    expect(toast.success).toHaveBeenCalledWith("Order cancelled");
  });

  it("cancelOrder shows error toast and returns false on failure", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(ordersResponse([mockOrder]));
    const { result } = renderHook(() => useMMOrders("market-1"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Not found" }), { status: 404 })
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.cancelOrder("order-1");
    });

    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });

  it("cancelAll calls the correct bulk-cancel URL", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(ordersResponse([]));
    const { result } = renderHook(() => useMMOrders("market-abc"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.mocked(global.fetch).mockResolvedValueOnce(ordersResponse([]));

    await act(async () => {
      await result.current.cancelAll();
    });

    const calls = vi.mocked(global.fetch).mock.calls;
    const cancelAllCall = calls.find(
      ([url, opts]) =>
        String(url).includes("cancel-all") && (opts as RequestInit)?.method === "DELETE"
    );
    expect(cancelAllCall).toBeDefined();
    expect(String(cancelAllCall![0])).toContain("market-abc");
  });

  it("cancelAll returns false and shows error toast on failure", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(ordersResponse([]));
    const { result } = renderHook(() => useMMOrders("market-1"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Forbidden" }), { status: 403 })
    );

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.cancelAll();
    });

    expect(success).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });
});
