"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCents } from "@/lib/format";
import type { Position } from "@/types/positions";

interface MultiOutcomePositionProps {
  readonly position: Position & { outcomeId?: string };
  readonly outcomes: Record<string, string>;
}

export function MultiOutcomePosition({
  position,
  outcomes,
}: MultiOutcomePositionProps) {
  const outcomeName =
    position.outcomeId ? (outcomes[position.outcomeId] ?? position.outcomeId) : null;

  let realisedColor = "text-muted-foreground";
  if (position.realisedPnlCents > 0) realisedColor = "text-emerald-600";
  else if (position.realisedPnlCents < 0) realisedColor = "text-red-600";

  return (
    <div className="flex flex-col gap-1 rounded-md border border-border px-4 py-3 hover:bg-muted/30 transition-colors text-sm">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/app/markets/${position.marketId}`}
          className="font-medium hover:underline line-clamp-2"
        >
          {position.marketTitle}
          {outcomeName && (
            <span className="text-muted-foreground font-normal">
              {" "}&rarr; {outcomeName}
            </span>
          )}
        </Link>
        <Badge variant="outline" className="shrink-0">
          Multi
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          Qty: <span className="tabular-nums text-foreground">{position.quantity}</span>
        </span>
        <span>
          Avg:{" "}
          <span className="tabular-nums text-foreground">
            {position.averagePriceCents}¢
          </span>
        </span>
        <span>
          Realised:{" "}
          <span className={`tabular-nums font-medium ${realisedColor}`}>
            {formatCents(position.realisedPnlCents, true)}
          </span>
        </span>
      </div>
    </div>
  );
}
