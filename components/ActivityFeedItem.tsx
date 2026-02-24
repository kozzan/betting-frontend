"use client";

import Link from "next/link";
import type { ActivityEvent } from "@/types/activity";

interface ActivityFeedItemProps {
  readonly event: ActivityEvent;
  readonly isNew?: boolean;
}

function timeAgo(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return `${Math.floor(diffHr / 24)}d ago`;
}

function eventDescription(event: ActivityEvent): string {
  switch (event.type) {
    case "TRADE":
      return `Traded at ${event.priceCents ?? "?"}¢`;
    case "MARKET_OPENED":
      return "New market opened";
    case "MARKET_SETTLED":
      return `Resolved ${event.outcome ?? ""}`;
  }
}

function eventIcon(type: ActivityEvent["type"]): string {
  switch (type) {
    case "TRADE":
      return "↔";
    case "MARKET_OPENED":
      return "+";
    case "MARKET_SETTLED":
      return "✓";
  }
}

function iconColor(type: ActivityEvent["type"]): string {
  switch (type) {
    case "TRADE":
      return "text-blue-500 dark:text-blue-400";
    case "MARKET_OPENED":
      return "text-emerald-500 dark:text-emerald-400";
    case "MARKET_SETTLED":
      return "text-amber-500 dark:text-amber-400";
  }
}

export function ActivityFeedItem({ event, isNew }: ActivityFeedItemProps) {
  return (
    <Link
      href={`/app/markets/${event.marketId}`}
      className={`flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors group ${
        isNew ? "animate-feed-in" : ""
      }`}
    >
      <span
        className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold mt-0.5 ${iconColor(event.type)}`}
        aria-hidden="true"
      >
        {eventIcon(event.type)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug line-clamp-1 group-hover:text-foreground text-foreground/90">
          {event.marketTitle}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {eventDescription(event)} &middot; {timeAgo(event.timestamp)}
        </p>
      </div>
    </Link>
  );
}
