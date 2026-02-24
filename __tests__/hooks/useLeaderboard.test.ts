import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { SWRConfig } from "swr";
import React from "react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import type { LeaderboardEntry } from "@/types/leaderboard";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, {
    value: { dedupingInterval: 0, provider: () => new Map() },
    children,
  });

const mockEntry: LeaderboardEntry = {
  rank: 1,
  userId: "u1",
  username: "apex_trader",
  pnlCents: 50000,
  tradeCount: 120,
  winRate: 0.72,
};

describe("useLeaderboard", () => {
  it("starts in loading state with empty entries", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useLeaderboard("7d"), { wrapper });
    expect(result.current.entries).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("loads entries successfully", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([mockEntry]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useLeaderboard("7d"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.entries).toHaveLength(1);
    expect(result.current.entries[0].username).toBe("apex_trader");
  });

  it("includes period in the request URL", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useLeaderboard("30d"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      expect.stringContaining("period=30d")
    );
  });

  it("exposes error message string on failure", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Fetch failed: 503"));
    const { result } = renderHook(() => useLeaderboard("all-time"), { wrapper });
    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error).toContain("Fetch failed");
  });

  it("returns null error on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useLeaderboard("7d"), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
  });
});
