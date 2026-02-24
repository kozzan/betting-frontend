"use client";

import { useRef, useEffect, useState } from "react";
import { useActivityFeed } from "@/hooks/useActivityFeed";
import { ActivityFeedItem } from "./ActivityFeedItem";
import type { ActivityEvent } from "@/types/activity";

const SKELETON_IDS = ["sk-a", "sk-b", "sk-c", "sk-d", "sk-e"];

function FeedSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {SKELETON_IDS.map((id) => (
        <div key={id} className="flex items-start gap-3 px-3 py-2.5">
          <div className="w-5 h-5 rounded-full bg-muted animate-pulse shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 rounded bg-muted animate-pulse w-3/4" />
            <div className="h-3 rounded bg-muted animate-pulse w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityFeed() {
  const { events, isLoading } = useActivityFeed(20);
  const prevIdsRef = useRef<Set<string>>(new Set());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (events.length === 0) return;

    const incoming = new Set(events.map((e) => e.id));
    const fresh = new Set<string>();
    for (const id of incoming) {
      if (!prevIdsRef.current.has(id)) fresh.add(id);
    }

    if (fresh.size > 0) {
      setNewIds(fresh);
      const timer = setTimeout(() => setNewIds(new Set()), 1500);
      prevIdsRef.current = incoming;
      return () => clearTimeout(timer);
    }

    prevIdsRef.current = incoming;
  }, [events]);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-sm font-medium">Recent Activity</span>
        <span className="text-xs text-muted-foreground">Live &bull; 10s</span>
      </div>

      {isLoading && <FeedSkeleton />}
      {!isLoading && events.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8 px-4">
          No recent activity.
        </p>
      )}
      {!isLoading && events.length > 0 && (
        <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
          {events.map((event: ActivityEvent) => (
            <ActivityFeedItem
              key={event.id}
              event={event}
              isNew={newIds.has(event.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
