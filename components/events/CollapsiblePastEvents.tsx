"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Event } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";

interface CollapsiblePastEventsProps {
  readonly events: Event[];
}

export function CollapsiblePastEvents({ events }: CollapsiblePastEventsProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="space-y-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-lg font-medium hover:text-muted-foreground transition-colors"
      >
        Past Events{" "}
        <span className="text-sm text-muted-foreground font-normal">({events.length})</span>
        {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {open && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  );
}
