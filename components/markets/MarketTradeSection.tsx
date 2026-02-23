"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlaceOrderPanel } from "@/components/orders/PlaceOrderPanel";
import type { OrderSide } from "@/types/orders";

interface MarketTradeSectionProps {
  readonly marketId: string;
  readonly isAuthenticated: boolean;
  readonly fromPath: string;
}

export function MarketTradeSection({ marketId, isAuthenticated, fromPath }: MarketTradeSectionProps) {
  const [activeSide, setActiveSide] = useState<OrderSide | null>(null);
  const router = useRouter();

  function handleSideClick(side: OrderSide) {
    if (!isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(fromPath)}`);
      return;
    }
    setActiveSide(side);
  }

  return (
    <div className="space-y-3">
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
