"use client";

import type { OrderBook as OrderBookType } from "@/types/markets";
import { useOrderBook } from "@/hooks/useOrderBook";
import { DepthChart } from "./DepthChart";

interface OrderBookProps {
  readonly marketId: string;
}

function PriceLadder({
  levels,
  side,
}: {
  readonly levels: OrderBookType["bids"];
  readonly side: "bid" | "ask";
}) {
  if (levels.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-4 text-center">No orders</p>
    );
  }

  const maxQty = Math.max(...levels.map((l) => l.totalQuantity));

  return (
    <div className="space-y-0.5">
      {levels.slice(0, 8).map((level) => {
        const pct = Math.round((level.totalQuantity / maxQty) * 100);
        const priceDisplay = `${level.priceCents}¢`;
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
                isBid ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {priceDisplay}
            </span>
            <span className="relative text-muted-foreground">
              {level.totalQuantity.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ConnectionIndicator({ isConnected }: { readonly isConnected: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={`inline-block size-2 rounded-full ${
          isConnected ? "bg-emerald-500" : "bg-red-500"
        }`}
        title={isConnected ? "Connected" : "Disconnected"}
      />
      {isConnected ? "Live" : "Reconnecting…"}
    </span>
  );
}

export function OrderBook({ marketId }: OrderBookProps) {
  const { bids, asks, isConnected, isLoading, error } = useOrderBook(marketId);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-sm font-medium">Order Book</span>
        {!isLoading && !error && <ConnectionIndicator isConnected={isConnected} />}
      </div>

      {error && (
        <p className="text-xs text-destructive px-4 py-3">{error}</p>
      )}

      {isLoading && (
        <p className="text-xs text-muted-foreground px-4 py-3">Loading...</p>
      )}

      {!isLoading && !error && (
        <>
          <div className="grid grid-cols-2 divide-x divide-border">
            <div>
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
                Bids (YES)
              </p>
              <PriceLadder levels={bids} side="bid" />
            </div>
            <div>
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
                Asks (YES)
              </p>
              <PriceLadder levels={asks} side="ask" />
            </div>
          </div>
          <DepthChart bids={bids} asks={asks} />
        </>
      )}
    </div>
  );
}
