import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { SWRConfig } from "swr";
import React from "react";
import { useNotifications, useUnreadCount } from "@/hooks/useNotifications";
import type { Notification } from "@/types/notification";

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(SWRConfig, {
    value: { dedupingInterval: 0, provider: () => new Map() },
    children,
  });

const mockNotification: Notification = {
  id: "n1",
  type: "ORDER_FILLED",
  title: "Order filled",
  message: "Your order was filled at 65¢",
  isRead: false,
  createdAt: new Date().toISOString(),
};

function pagedResponse(items: Notification[]) {
  return new Response(
    JSON.stringify({
      data: { content: items, totalElements: items.length, totalPages: 1, page: 0, size: 20 },
      meta: { requestId: "r1", timestamp: "" },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

describe("useNotifications", () => {
  it("starts with empty notifications while loading", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useNotifications(), { wrapper });
    expect(result.current.notifications).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("returns notification items from paginated response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(pagedResponse([mockNotification]));
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].id).toBe("n1");
  });

  it("markAsRead calls PATCH on the notification endpoint", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(pagedResponse([mockNotification]));
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.mocked(global.fetch).mockResolvedValueOnce(pagedResponse([]));

    await act(async () => {
      await result.current.markAsRead("n1");
    });

    const calls = vi.mocked(global.fetch).mock.calls;
    const patchCall = calls.find(
      ([url, opts]) =>
        String(url).includes("/n1/read") && (opts as RequestInit)?.method === "PATCH"
    );
    expect(patchCall).toBeDefined();
  });

  it("markAllAsRead calls PATCH on /api/notifications", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(pagedResponse([mockNotification]));
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 200 }));
    vi.mocked(global.fetch).mockResolvedValueOnce(pagedResponse([]));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    const calls = vi.mocked(global.fetch).mock.calls;
    const patchAll = calls.find(
      ([url, opts]) =>
        String(url) === "/api/notifications" && (opts as RequestInit)?.method === "PATCH"
    );
    expect(patchAll).toBeDefined();
  });

  it("uses unreadOnly query param when true", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(pagedResponse([]));
    const { result } = renderHook(() => useNotifications(true), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      expect.stringContaining("unreadOnly=true")
    );
  });
});

describe("useUnreadCount", () => {
  it("returns 0 while loading", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useUnreadCount(), { wrapper });
    expect(result.current.count).toBe(0);
  });

  it("returns count from response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ count: 5 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    const { result } = renderHook(() => useUnreadCount(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.count).toBe(5);
  });
});
