import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import React from "react";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import type { ActivityEvent } from "@/types/activity";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, {
    value: { dedupingInterval: 0, provider: () => new Map() },
    children,
  });

const mockEvent: ActivityEvent = {
  id: "ev1",
  type: "TRADE",
  marketId: "market-1",
  marketTitle: "Will BTC hit $100k?",
  priceCents: 65,
  quantity: 10,
  timestamp: new Date().toISOString(),
};

describe("useActivityFeed", () => {
  it("starts in loading state with empty events", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useActivityFeed(), { wrapper });
    expect(result.current.events).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("loads events successfully", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([mockEvent]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useActivityFeed(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].id).toBe("ev1");
  });

  it("includes limit param in URL", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useActivityFeed(5), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      expect.stringContaining("limit=5")
    );
  });

  it("uses default limit of 20 when not specified", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useActivityFeed(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      expect.stringContaining("limit=20")
    );
  });

  it("exposes error message on failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Activity feed fetch failed: 503"));
    const { result } = renderHook(() => useActivityFeed(), { wrapper });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toContain("503");
  });

  it("returns null error on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useActivityFeed(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
