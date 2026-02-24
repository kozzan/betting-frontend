import Link from "next/link";
import Image from "next/image";
import { Calendar, BarChart2 } from "lucide-react";
import type { Event } from "@/types/event";

interface EventCardProps {
  readonly event: Event;
}

function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate && !endDate) return "Date TBD";
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(iso));
  if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
  if (startDate) return `From ${fmt(startDate)}`;
  return `Until ${fmt(endDate!)}`;
}

const GRADIENT_PLACEHOLDERS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-red-600",
  "from-violet-500 to-purple-600",
  "from-pink-500 to-rose-600",
  "from-cyan-500 to-sky-600",
];

function gradientForId(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.codePointAt(i)!) >>> 0;
  }
  return GRADIENT_PLACEHOLDERS[hash % GRADIENT_PLACEHOLDERS.length];
}

export function EventCard({ event }: EventCardProps) {
  const gradient = gradientForId(event.id);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Cover image or gradient placeholder */}
      <div className="relative h-36 w-full shrink-0">
        {event.coverImageUrl ? (
          <Image
            src={event.coverImageUrl}
            alt={event.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={`h-full w-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <BarChart2 className="size-10 text-white/70" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2">{event.name}</h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" />
          <span>{formatDateRange(event.startDate, event.endDate)}</span>
        </div>

        <div className="text-xs text-muted-foreground">
          {event.marketCount} {event.marketCount === 1 ? "market" : "markets"}
        </div>

        <div className="mt-auto">
          <Link
            href={`/app/events/${event.id}`}
            className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            View Event
          </Link>
        </div>
      </div>
    </div>
  );
}
