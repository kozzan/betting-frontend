import useSWR from "swr";
import type { Notification } from "@/types/notification";
import type { ApiResponse, PagedResponse } from "@/types/markets";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export function useNotifications(unreadOnly = false) {
  const key = `/api/notifications?unreadOnly=${unreadOnly}&page=0&size=20`;
  const { data, isLoading, mutate } = useSWR<ApiResponse<PagedResponse<Notification>>>(
    key,
    fetcher
  );

  const notifications = data?.data?.content ?? [];

  async function markAsRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    await mutate();
  }

  async function markAllAsRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    await mutate();
  }

  return { notifications, isLoading, markAsRead, markAllAsRead, mutate };
}

export function useUnreadCount() {
  const { data, isLoading } = useSWR<{ count: number }>(
    "/api/notifications/unread-count",
    fetcher,
    { refreshInterval: 30_000 }
  );

  return { count: data?.count ?? 0, isLoading };
}
