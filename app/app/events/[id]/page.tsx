import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, PagedResponse } from "@/types/markets";
import type { Event, EventMarket } from "@/types/event";
import { EventBanner } from "@/components/events/EventBanner";
import { EventMarketsGrid } from "@/components/events/EventMarketsGrid";

interface PageProps {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<{ page?: string }>;
}

async function fetchEvent(id: string): Promise<Event | null> {
  try {
    const res = await apiRequest<ApiResponse<Event>>(`/api/v1/events/${id}`);
    return res.data;
  } catch {
    return null;
  }
}

async function fetchEventMarkets(
  id: string,
  page: number
): Promise<PagedResponse<EventMarket>> {
  try {
    const res = await apiRequest<ApiResponse<PagedResponse<EventMarket>>>(
      `/api/v1/events/${id}/markets?page=${page}&size=12`
    );
    return res.data;
  } catch {
    return { content: [], totalElements: 0, totalPages: 0, page: 0, size: 12 };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await fetchEvent(id);
  if (!event) return { title: "Event Not Found" };
  return {
    title: `${event.name} | Betting Platform`,
    description: event.description ?? `Browse markets in the ${event.name} event series.`,
    openGraph: {
      title: event.name,
      description: event.description ?? `Browse markets in the ${event.name} event series.`,
      type: "website",
      ...(event.coverImageUrl ? { images: [event.coverImageUrl] } : {}),
    },
  };
}

export default async function EventDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(0, parseInt(pageParam ?? "0", 10));

  const [event, marketsData] = await Promise.all([
    fetchEvent(id),
    fetchEventMarkets(id, page),
  ]);

  if (!event) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/app/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to Events
      </Link>

      <EventBanner event={event} />

      {event.description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {event.description}
        </p>
      )}

      <section className="space-y-4 pt-2">
        <h2 className="text-lg font-semibold">Markets in this Event</h2>
        <EventMarketsGrid
          markets={marketsData.content}
          currentPage={marketsData.page}
          totalPages={marketsData.totalPages}
          totalElements={marketsData.totalElements}
          eventId={id}
        />
      </section>
    </div>
  );
}
