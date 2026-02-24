import Link from "next/link";
import { Clock, TrendingUp } from "lucide-react";
import type { EventMarket } from "@/types/event";
import { Badge } from "@/components/ui/badge";
import { MarketProbabilityBadge } from "@/components/markets/MarketProbabilityBadge";

interface EventMarketsGridProps {
  readonly markets: EventMarket[];
  readonly currentPage: number;
  readonly totalPages: number;
  readonly totalElements: number;
  readonly eventId: string;
}

function formatCloseTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0)
    return `Closed ${date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays > 0) return `${diffDays}d left`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours > 0) return `${diffHours}h left`;
  const diffMins = Math.floor(diffMs / 60_000);
  return `${diffMins}m left`;
}

function formatVolume(cents?: number): string {
  if (cents == null) return "";
  if (cents >= 100_000) return `$${(cents / 100_000).toFixed(1)}k vol`;
  return `$${(cents / 100).toFixed(0)} vol`;
}

function statusVariant(status: string): "default" | "secondary" | "outline" {
  if (status === "OPEN") return "default";
  if (status === "SETTLED") return "outline";
  return "secondary";
}

export function EventMarketsGrid({
  markets,
  currentPage,
  totalPages,
  totalElements,
  eventId,
}: EventMarketsGridProps) {
  if (markets.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground text-sm">
        No markets in this event yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {markets.map((market) => (
          <div
            key={market.id}
            className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium leading-snug line-clamp-2 flex-1">
                {market.title}
              </h3>
              <Badge variant={statusVariant(market.status)} className="shrink-0 text-xs">
                {market.status}
              </Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {market.status === "OPEN" && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="size-3.5" />
                  <MarketProbabilityBadge marketId={market.id} />
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {formatCloseTime(market.closeTime)}
              </span>
              {market.volumeCents != null && (
                <span>{formatVolume(market.volumeCents)}</span>
              )}
            </div>

            <div className="mt-auto">
              <Link
                href={`/app/markets/${market.slug ?? market.id}`}
                className="inline-flex items-center justify-center w-full px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Trade
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm pt-2">
          <span className="text-muted-foreground">
            {totalElements} {totalElements === 1 ? "market" : "markets"}
          </span>
          <div className="flex items-center gap-2">
            {currentPage > 0 && (
              <Link
                href={`/app/events/${eventId}?page=${currentPage - 1}`}
                className="px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors"
              >
                Previous
              </Link>
            )}
            <span className="text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </span>
            {currentPage < totalPages - 1 && (
              <Link
                href={`/app/events/${eventId}?page=${currentPage + 1}`}
                className="px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
