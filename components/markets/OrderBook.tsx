"use client";

import useSWR from "swr";
import type { ApiResponse, OrderBook as OrderBookType } from "@/types/markets";

interface OrderBookProps {
  readonly marketId: string;
}

async function fetcher(url: string): Promise<OrderBookType> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load order book");
  const json: ApiResponse<OrderBookType> = await res.json();
  return json.data;
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
            <span className={`relative font-mono font-medium ${isBid ? "text-emerald-600" : "text-red-600"}`}>
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

export function OrderBook({ marketId }: OrderBookProps) {
  const { data, error, isLoading } = useSWR(
    `/api/markets/${marketId}/orders`,
    fetcher,
    { refreshInterval: 5000 }
  );

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-sm font-medium">Order Book</span>
        {!isLoading && !error && (
          <span className="text-xs text-muted-foreground">Live · 5s</span>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive px-4 py-3">
          Failed to load order book.
        </p>
      )}

      {isLoading && (
        <p className="text-xs text-muted-foreground px-4 py-3">Loading...</p>
      )}

      {data && (
        <div className="grid grid-cols-2 divide-x divide-border">
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
              Bids (YES)
            </p>
            <PriceLadder levels={data.bids} side="bid" />
          </div>
          <div>
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b border-border">
              Asks (YES)
            </p>
            <PriceLadder levels={data.asks} side="ask" />
          </div>
        </div>
      )}
    </div>
  );
}
