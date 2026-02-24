import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { SWRConfig } from "swr";
import React from "react";
import { useAlerts } from "@/hooks/useAlerts";
import type { PriceAlert } from "@/types/alert";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, {
    value: { dedupingInterval: 0, provider: () => new Map() },
    children,
  });

const mockAlert: PriceAlert = {
  id: "alert-1",
  marketId: "market-1",
  marketTitle: "Test Market",
  thresholdCents: 65,
  direction: "ABOVE",
  status: "ACTIVE",
  createdAt: new Date().toISOString(),
};

function alertsResponse(items: PriceAlert[]) {
  return new Response(
    JSON.stringify({ data: items, meta: { requestId: "r1", timestamp: "" } }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

describe("useAlerts", () => {
  it("starts in loading state with empty alerts", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useAlerts(), { wrapper });
    expect(result.current.alerts).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("loads alerts successfully", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(alertsResponse([mockAlert]));
    const { result } = renderHook(() => useAlerts(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.alerts).toHaveLength(1);
    expect(result.current.alerts[0].id).toBe("alert-1");
  });

  it("createAlert POSTs to /api/alerts with correct body", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(alertsResponse([]));
    const { result } = renderHook(() => useAlerts(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(new Response("{}", { status: 201 }));
    vi.mocked(global.fetch).mockResolvedValueOnce(alertsResponse([mockAlert]));

    await act(async () => {
      await result.current.createAlert({
        marketId: "market-1",
        thresholdCents: 65,
        direction: "ABOVE",
      });
    });

    const calls = vi.mocked(global.fetch).mock.calls;
    const postCall = calls.find(
      ([url, opts]) => String(url) === "/api/alerts" && (opts as RequestInit)?.method === "POST"
    );
    expect(postCall).toBeDefined();
    const body = JSON.parse((postCall![1] as RequestInit).body as string);
    expect(body).toMatchObject({ marketId: "market-1", thresholdCents: 65, direction: "ABOVE" });
  });

  it("createAlert throws on non-ok response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(alertsResponse([]));
    const { result } = renderHook(() => useAlerts(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Limit reached" }), { status: 400 })
    );

    await expect(
      act(async () => {
        await result.current.createAlert({ marketId: "m", thresholdCents: 50, direction: "BELOW" });
      })
    ).rejects.toThrow("Limit reached");
  });

  it("deleteAlert calls DELETE and applies optimistic update", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(alertsResponse([mockAlert]));
    const { result } = renderHook(() => useAlerts(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.mocked(global.fetch).mockResolvedValueOnce(alertsResponse([]));

    await act(async () => {
      await result.current.deleteAlert("alert-1");
    });

    const calls = vi.mocked(global.fetch).mock.calls;
    const deleteCall = calls.find(
      ([url, opts]) =>
        String(url).includes("alert-1") && (opts as RequestInit)?.method === "DELETE"
    );
    expect(deleteCall).toBeDefined();
  });

  it("exposes error state when fetch fails", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));
    const { result } = renderHook(() => useAlerts(), { wrapper });
    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error?.message).toContain("Network error");
  });
});
