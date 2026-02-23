"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { PlaceOrderPanel } from "@/components/orders/PlaceOrderPanel";
import { calcImpliedProbability } from "@/lib/probability";
import type { ApiResponse, OrderBook } from "@/types/markets";
import type { OrderSide } from "@/types/orders";

interface MarketTradeSectionProps {
  readonly marketId: string;
  readonly isAuthenticated: boolean;
  readonly fromPath: string;
}

async function orderBookFetcher(url: string): Promise<OrderBook> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load order book");
  const json: ApiResponse<OrderBook> = await res.json();
  return json.data;
}

export function MarketTradeSection({ marketId, isAuthenticated, fromPath }: MarketTradeSectionProps) {
  const [activeSide, setActiveSide] = useState<OrderSide | null>(null);
  const router = useRouter();

  const { data: book, error: bookError } = useSWR(
    `/api/markets/${marketId}/orders`,
    orderBookFetcher,
    { refreshInterval: 5000 }
  );

  const yesPct = bookError || !book ? null : calcImpliedProbability(book);
  const noPct = yesPct === null ? null : 100 - yesPct;

  function handleSideClick(side: OrderSide) {
    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(fromPath)}`);
      return;
    }
    setActiveSide(side);
  }

  return (
    <div className="space-y-3">
      {/* Probability bar */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">YES</p>
            <p className="text-xl font-semibold tabular-nums text-emerald-600">
              {yesPct === null ? "— %" : `${yesPct}%`}
            </p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">NO</p>
            <p className="text-xl font-semibold tabular-nums text-red-600">
              {noPct === null ? "— %" : `${noPct}%`}
            </p>
          </div>
        </div>
        {yesPct !== null && (
          <div className="h-1.5 flex">
            <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${yesPct}%` }} />
            <div className="bg-red-500 flex-1 transition-all duration-300" />
          </div>
        )}
      </div>

      {/* Trade buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-label="Buy YES shares"
          onClick={() => handleSideClick("YES")}
          className="rounded-md py-3 text-sm font-semibold transition-colors bg-emerald-600 hover:bg-emerald-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Buy YES
        </button>
        <button
          type="button"
          aria-label="Buy NO shares"
          onClick={() => handleSideClick("NO")}
          className="rounded-md py-3 text-sm font-semibold transition-colors bg-red-600 hover:bg-red-700 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Buy NO
        </button>
      </div>

      {activeSide && (
        <PlaceOrderPanel
          marketId={marketId}
          initialSide={activeSide}
          onClose={() => setActiveSide(null)}
        />
      )}
    </div>
  );
}
