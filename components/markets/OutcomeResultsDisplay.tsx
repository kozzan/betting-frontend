"use client";

import type { MarketOutcome } from "@/types/market-outcome";

interface OutcomeResultsDisplayProps {
  readonly outcomes: MarketOutcome[];
  readonly settlementOutcomeId?: string | null;
}

export function OutcomeResultsDisplay({
  outcomes,
  settlementOutcomeId,
}: OutcomeResultsDisplayProps) {
  const sorted = [...outcomes].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Settlement Results
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {sorted.map((outcome) => {
          const isWinner =
            outcome.resolved || outcome.id === settlementOutcomeId;

          return (
            <div
              key={outcome.id}
              className={[
                "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
                isWinner
                  ? "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300"
                  : "border-border bg-muted/30 text-muted-foreground",
              ].join(" ")}
            >
              <span className="text-base leading-none" aria-hidden>
                {isWinner ? "\u{1F3C6}" : "\u2717"}
              </span>
              <span className="flex-1 font-medium truncate">{outcome.name}</span>
              {isWinner && (
                <span className="text-xs font-semibold shrink-0">Winner</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
