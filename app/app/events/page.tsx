import type { Metadata } from "next";
import { apiRequest } from "@/lib/api";
import type { ApiResponse } from "@/types/markets";
import type { Event } from "@/types/event";
import { EventCard } from "@/components/events/EventCard";
import { CollapsiblePastEvents } from "@/components/events/CollapsiblePastEvents";

export const metadata: Metadata = {
  title: "Events | Betting Platform",
  description: "Browse prediction market event series — from sports tournaments to political races.",
  openGraph: {
    title: "Events | Betting Platform",
    description: "Browse prediction market event series — from sports tournaments to political races.",
    type: "website",
  },
};

async function fetchEvents(): Promise<Event[]> {
  try {
    const res = await apiRequest<ApiResponse<Event[]>>("/api/v1/events");
    return res.data;
  } catch {
    return [];
  }
}

export default async function EventsPage() {
  const events = await fetchEvents();

  const activeEvents = events.filter((e) => e.status === "ACTIVE");
  const inactiveEvents = events.filter((e) => e.status === "INACTIVE");

  // Split inactive into upcoming and past based on dates
  const now = new Date();
  const upcomingEvents = inactiveEvents.filter(
    (e) => e.startDate && new Date(e.startDate) > now
  );
  const pastEvents = inactiveEvents.filter(
    (e) => !e.startDate || new Date(e.startDate) <= now
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Events</h1>
        <p className="text-muted-foreground text-sm">
          Curated collections of related prediction markets.
        </p>
      </div>

      {/* Active Events */}
      <section className="space-y-4">
        <h2 className="text-lg font-medium">Active Events</h2>
        {activeEvents.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">
            No active events at the moment. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-medium">Upcoming Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Past Events (collapsible) */}
      {pastEvents.length > 0 && (
        <CollapsiblePastEvents events={pastEvents} />
      )}
    </div>
  );
}
