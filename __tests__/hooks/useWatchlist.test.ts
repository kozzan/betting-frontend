import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { SWRConfig } from "swr";
import React from "react";
import { useWatchlist } from "@/hooks/useWatchlist";
import type { MarketSummary } from "@/types/markets";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, {
    value: { dedupingInterval: 0, provider: () => new Map() },
    children,
  });

const mockMarket: MarketSummary = {
  id: "market-1",
  slug: "test-market",
  title: "Test Market",
  category: "CRYPTO",
  status: "OPEN",
  closeTime: "2025-12-31T00:00:00Z",
};

function watchlistResponse(markets: MarketSummary[]) {
  return new Response(
    JSON.stringify({ data: { markets }, meta: { requestId: "r1", timestamp: "" } }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

describe("useWatchlist", () => {
  it("starts in loading state", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useWatchlist(), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.watchlist).toEqual([]);
  });

  it("loads watchlist data successfully", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(watchlistResponse([mockMarket]));
    const { result } = renderHook(() => useWatchlist(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.watchlist).toHaveLength(1);
    expect(result.current.watchlist[0].id).toBe("market-1");
  });

  it("isWatched returns true for watched market", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(watchlistResponse([mockMarket]));
    const { result } = renderHook(() => useWatchlist(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isWatched("market-1")).toBe(true);
  });

  it("isWatched returns false for unwatched market", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(watchlistResponse([]));
    const { result } = renderHook(() => useWatchlist(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isWatched("market-999")).toBe(false);
  });

  it("addToWatchlist calls POST and revalidates", async () => {
    // Initial load
    vi.mocked(global.fetch).mockResolvedValueOnce(watchlistResponse([]));
    const { result } = renderHook(() => useWatchlist(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Add call
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));
    // Revalidation
    vi.mocked(global.fetch).mockResolvedValueOnce(watchlistResponse([mockMarket]));

    await act(async () => {
      await result.current.addToWatchlist("market-1");
    });

    const calls = vi.mocked(global.fetch).mock.calls;
    const postCall = calls.find(
      ([url, opts]) => String(url).includes("market-1") && (opts as RequestInit)?.method === "POST"
    );
    expect(postCall).toBeDefined();
  });

  it("removeFromWatchlist calls DELETE", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(watchlistResponse([mockMarket]));
    const { result } = renderHook(() => useWatchlist(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.mocked(global.fetch).mockResolvedValueOnce(watchlistResponse([]));

    await act(async () => {
      await result.current.removeFromWatchlist("market-1");
    });

    const calls = vi.mocked(global.fetch).mock.calls;
    const deleteCall = calls.find(
      ([url, opts]) =>
        String(url).includes("market-1") && (opts as RequestInit)?.method === "DELETE"
    );
    expect(deleteCall).toBeDefined();
  });
});
