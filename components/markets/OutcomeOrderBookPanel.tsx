"use client";

import type { PriceLevel } from "@/types/market-outcome";
import { useOutcomeOrderBook } from "@/hooks/useOutcomeOrderBook";

interface OutcomeOrderBookPanelProps {
  readonly marketId: string;
  readonly outcomeId: string;
}

function PriceLadder({
  levels,
  side,
}: {
  readonly levels: PriceLevel[];
  readonly side: "bid" | "ask";
}) {
  if (levels.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">No orders</p>
    );
  }

  const maxQty = Math.max(...levels.map((l) => l.quantity));

  return (
    <div className="space-y-0.5">
      {levels.slice(0, 8).map((level) => {
        const pct = Math.round((level.quantity / maxQty) * 100);
        const isBid = side === "bid";

        return (
          <div
            key={level.priceCents}
            className="relative flex items-center justify-between px-3 py-1.5 text-xs rounded overflow-hidden"
          >
            <div
              className={`absolute inset-y-0 ${isBid ? "right-0" : "left-0"} ${
                isBid ? "bg-emerald-500/10" : "bg-red-500/10"
              }`}
              style={{ width: `${pct}%` }}
            />
            <span
              className={`relative font-mono font-medium ${
                isBid
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {level.priceCents}¢
            </span>
            <span className="relative text-muted-foreground">
              {level.quantity.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function OutcomeOrderBookPanel({
  marketId,
  outcomeId,
}: OutcomeOrderBookPanelProps) {
  const { orderBook, isLoading } = useOutcomeOrderBook(marketId, outcomeId);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-sm font-medium">Order Book</span>
      </div>

      {isLoading && (
        <p className="text-xs text-muted-foreground px-4 py-3">Loading...</p>
      )}

      {!isLoading && orderBook && (
        <div className="grid grid-cols-2 divide-x divide-border">
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
              Bids
            </p>
            <PriceLadder levels={orderBook.bids} side="bid" />
          </div>
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
              Asks
            </p>
            <PriceLadder levels={orderBook.asks} side="ask" />
          </div>
        </div>
      )}

      {!isLoading && !orderBook && (
        <p className="text-xs text-muted-foreground px-4 py-3">
          No order book data available.
        </p>
      )}
    </div>
  );
}
