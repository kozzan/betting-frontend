"use client";

import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification";
import {
  CheckCircle,
  Bell,
  TrendingDown,
  Clock,
  Megaphone,
  BellRing,
} from "lucide-react";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationIcon({ type }: { readonly type: NotificationType }) {
  switch (type) {
    case "ORDER_FILLED":
      return <CheckCircle className="size-4 text-emerald-500 shrink-0" />;
    case "ALERT_TRIGGERED":
      return <BellRing className="size-4 text-amber-500 shrink-0" />;
    case "MARKET_RESOLVED":
      return <TrendingDown className="size-4 text-blue-500 shrink-0" />;
    case "MARKET_CLOSING_SOON":
      return <Clock className="size-4 text-orange-500 shrink-0" />;
    case "PLATFORM_ANNOUNCEMENT":
      return <Megaphone className="size-4 text-purple-500 shrink-0" />;
    default:
      return <Bell className="size-4 text-muted-foreground shrink-0" />;
  }
}

interface NotificationItemProps {
  readonly notification: Notification;
  readonly onClick?: () => void;
  readonly compact?: boolean;
}

export function NotificationItem({ notification, onClick, compact = false }: NotificationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left flex gap-3 px-3 py-2.5 transition-colors hover:bg-accent/50",
        !notification.isRead && "bg-accent/30",
        onClick && "cursor-pointer"
      )}
    >
      <div className="mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm leading-tight", !notification.isRead && "font-medium")}>
            {notification.title}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
            {timeAgo(notification.createdAt)}
          </span>
        </div>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {notification.message}
          </p>
        )}
        {compact && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {notification.message}
          </p>
        )}
      </div>
      {!notification.isRead && (
        <span className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
      )}
    </button>
  );
}
