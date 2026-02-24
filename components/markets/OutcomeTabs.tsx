"use client";

import type { MarketOutcome } from "@/types/market-outcome";

interface OutcomeTabsProps {
  readonly outcomes: MarketOutcome[];
  readonly selectedOutcomeId: string;
  readonly onSelect: (outcomeId: string) => void;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function OutcomeTabs({ outcomes, selectedOutcomeId, onSelect }: OutcomeTabsProps) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max border-b border-border pb-0">
        {outcomes.map((outcome) => {
          const isSelected = outcome.id === selectedOutcomeId;
          const isWinner = outcome.resolved;

          return (
            <button
              key={outcome.id}
              type="button"
              onClick={() => onSelect(outcome.id)}
              className={[
                "inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                isSelected
                  ? "border-blue-500 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
              ].join(" ")}
            >
              {truncate(outcome.name, 20)}
              {isWinner && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 text-xs px-1.5 py-0.5 font-medium">
                  Winner
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
