import Image from "next/image";
import { Calendar, BarChart2 } from "lucide-react";
import type { Event } from "@/types/event";

interface EventBannerProps {
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

export function EventBanner({ event }: EventBannerProps) {
  const gradient = gradientForId(event.id);

  return (
    <div className="relative w-full h-56 md:h-72 rounded-xl overflow-hidden mb-6">
      {event.coverImageUrl ? (
        <Image
          src={event.coverImageUrl}
          alt={event.name}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      ) : (
        <div className={`h-full w-full bg-gradient-to-br ${gradient}`} />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Text content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-2">{event.name}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {formatDateRange(event.startDate, event.endDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <BarChart2 className="size-4" />
            {event.marketCount} {event.marketCount === 1 ? "market" : "markets"}
          </span>
        </div>
      </div>
    </div>
  );
}
