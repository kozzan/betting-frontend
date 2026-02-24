"use client";

import { useState } from "react";
import type { MarketStatus } from "@/types/markets";
import type { MarketOutcome } from "@/types/market-outcome";
import { OutcomeTabs } from "./OutcomeTabs";
import { OutcomeOrderBookPanel } from "./OutcomeOrderBookPanel";
import { PlaceOutcomeOrderPanel } from "./PlaceOutcomeOrderPanel";

interface MultiOutcomeMarketProps {
  readonly marketId: string;
  readonly outcomes: MarketOutcome[];
  readonly marketStatus: MarketStatus;
}

export function MultiOutcomeMarket({
  marketId,
  outcomes,
  marketStatus,
}: MultiOutcomeMarketProps) {
  const sorted = [...outcomes].sort((a, b) => a.displayOrder - b.displayOrder);
  const [selectedOutcomeId, setSelectedOutcomeId] = useState<string>(
    sorted[0]?.id ?? ""
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No outcomes available for this market.
      </p>
    );
  }

  const selectedOutcome = sorted.find((o) => o.id === selectedOutcomeId) ?? sorted[0];

  return (
    <div className="space-y-4">
      <OutcomeTabs
        outcomes={sorted}
        selectedOutcomeId={selectedOutcomeId}
        onSelect={setSelectedOutcomeId}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <OutcomeOrderBookPanel
          marketId={marketId}
          outcomeId={selectedOutcomeId}
        />
        {marketStatus === "OPEN" && (
          <PlaceOutcomeOrderPanel
            marketId={marketId}
            outcomeId={selectedOutcomeId}
            outcomeName={selectedOutcome.name}
          />
        )}
        {marketStatus !== "OPEN" && (
          <div className="rounded-md border border-border bg-muted/20 px-4 py-6 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              This market is {marketStatus.toLowerCase()} — trading is unavailable.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
