"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications, useUnreadCount } from "@/hooks/useNotifications";
import { NotificationItem } from "@/components/NotificationItem";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { count } = useUnreadCount();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleMarkAllAsRead() {
    await markAllAsRead();
  }

  async function handleNotificationClick(id: string, referenceType?: string, referenceId?: string) {
    await markAsRead(id);
    setOpen(false);
    if (referenceType === "MARKET" && referenceId) {
      router.push(`/app/markets/${referenceId}`);
    }
  }

  const preview = notifications.slice(0, 10);

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        className="relative"
      >
        <Bell className="size-4" />
        {count > 0 && (
          <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground leading-none">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-1 z-50 w-80 rounded-md border bg-popover text-popover-foreground shadow-md",
            "animate-in fade-in-0 zoom-in-95"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <span className="text-sm font-medium">Notifications</span>
            {count > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {preview.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No notifications
              </p>
            ) : (
              preview.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  compact
                  onClick={() => handleNotificationClick(n.id, n.referenceType, n.referenceId)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-3 py-2">
            <Link
              href="/app/notifications"
              onClick={() => setOpen(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
