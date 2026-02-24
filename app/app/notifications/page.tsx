"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/components/NotificationItem";
import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const router = useRouter();
  const { notifications, isLoading, markAsRead, markAllAsRead } = useNotifications(unreadOnly);

  async function handleNotificationClick(id: string, referenceType?: string, referenceId?: string) {
    await markAsRead(id);
    if (referenceType === "MARKET" && referenceId) {
      router.push(`/app/markets/${referenceId}`);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          Mark all as read
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b">
        <button
          type="button"
          onClick={() => setUnreadOnly(false)}
          className={`px-3 py-1.5 text-sm transition-colors border-b-2 -mb-px ${
            unreadOnly
              ? "border-transparent text-muted-foreground hover:text-foreground"
              : "border-primary text-foreground font-medium"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setUnreadOnly(true)}
          className={`px-3 py-1.5 text-sm transition-colors border-b-2 -mb-px ${
            unreadOnly
              ? "border-primary text-foreground font-medium"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread
        </button>
      </div>

      {/* Notifications list */}
      <div className="rounded-md border border-border divide-y divide-border overflow-hidden">
        {isLoading && (
          <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
        )}
        {!isLoading && notifications.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {unreadOnly ? "No unread notifications" : "No notifications yet"}
          </p>
        )}
        {!isLoading && notifications.length > 0 && notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onClick={() => handleNotificationClick(n.id, n.referenceType, n.referenceId)}
          />
        ))}
      </div>
    </div>
  );
}
