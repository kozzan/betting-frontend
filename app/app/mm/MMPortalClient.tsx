"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ApiResponse, MarketSummary, PagedResponse } from "@/types/markets";
import type { Order } from "@/types/orders";

interface MMPortalClientProps {
  readonly initialOrders: Order[];
}

async function ordersFetcher(url: string): Promise<Order[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch orders");
  const json: ApiResponse<PagedResponse<Order>> = await res.json();
  return json.data.content;
}

async function marketSearchFetcher(url: string): Promise<MarketSummary[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to search markets");
  const json: ApiResponse<PagedResponse<MarketSummary>> = await res.json();
  return json.data.content;
}

interface MarketGroup {
  marketId: string;
  orders: Order[];
}

function groupByMarket(orders: Order[]): MarketGroup[] {
  const map = new Map<string, Order[]>();
  for (const order of orders) {
    const list = map.get(order.marketId) ?? [];
    list.push(order);
    map.set(order.marketId, list);
  }
  return Array.from(map.entries()).map(([marketId, orders]) => ({
    marketId,
    orders,
  }));
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function CancelAllMarketButton({ marketId, onSuccess }: { readonly marketId: string; readonly onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleCancelAll() {
    setLoading(true);
    try {
      const res = await fetch(`/api/mm/${encodeURIComponent(marketId)}/cancel-all`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const err = await res.json();
          message = err?.message ?? err?.error ?? message;
        } catch {
          // ignore
        }
        toast.error(message);
        return;
      }
      toast.success("All orders cancelled for market");
      onSuccess();
    } catch {
      toast.error("Failed to cancel all orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleCancelAll}
      disabled={loading}
    >
      {loading ? "Cancelling…" : "Cancel All"}
    </Button>
  );
}

export function MMPortalClient({ initialOrders }: MMPortalClientProps) {
  const router = useRouter();
  const [quickMarketId, setQuickMarketId] = useState("");
  const [marketSearch, setMarketSearch] = useState("");

  const { data: orders, mutate: mutateOrders } = useSWR<Order[]>(
    "/api/orders?status=OPEN&size=200&sort=createdAt,desc",
    ordersFetcher,
    {
      fallbackData: initialOrders,
      refreshInterval: 30_000,
    }
  );

  const { data: searchResults } = useSWR<MarketSummary[]>(
    marketSearch.length >= 2
      ? `/api/markets?q=${encodeURIComponent(marketSearch)}&status=OPEN&size=10`
      : null,
    marketSearchFetcher
  );

  const activeOrders = orders ?? [];
  const marketGroups = groupByMarket(activeOrders);

  const totalOpenOrders = activeOrders.length;
  const totalExposureCents = activeOrders.reduce(
    (sum, o) => sum + o.heldAmountCents,
    0
  );

  function handleGoToMarket() {
    const id = quickMarketId.trim();
    if (!id) {
      toast.error("Enter a market ID");
      return;
    }
    router.push(`/app/mm/markets/${encodeURIComponent(id)}`);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Market Maker Portal</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your quoting activity across all markets.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-border p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Open Orders
          </p>
          <p className="text-2xl font-semibold tabular-nums">{totalOpenOrders}</p>
        </div>
        <div className="rounded-md border border-border p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Total Exposure
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCents(totalExposureCents)}
          </p>
        </div>
      </div>

      {/* Active Markets */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Active Markets ({marketGroups.length})
        </h2>

        {marketGroups.length === 0 ? (
          <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No active orders. Use the quote entry below to get started.
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden divide-y divide-border">
            {marketGroups.map(({ marketId, orders: mktOrders }) => {
              const exposure = mktOrders.reduce(
                (sum, o) => sum + o.heldAmountCents,
                0
              );
              return (
                <div
                  key={marketId}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-muted-foreground">
                      {marketId}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mktOrders.length} open order{mktOrders.length === 1 ? "" : "s"} &middot;{" "}
                      {formatCents(exposure)} held
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/app/mm/markets/${encodeURIComponent(marketId)}`}>
                        Manage
                      </Link>
                    </Button>
                    <CancelAllMarketButton
                      marketId={marketId}
                      onSuccess={() => { mutateOrders(); }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Quote Entry */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Quick Quote Entry
        </h2>
        <div className="rounded-md border border-border p-4 space-y-4">
          {/* Market ID direct entry */}
          <div className="space-y-1.5">
            <label htmlFor="quick-market-id" className="text-xs text-muted-foreground">
              Market ID (paste directly)
            </label>
            <div className="flex gap-2">
              <input
                id="quick-market-id"
                type="text"
                value={quickMarketId}
                onChange={(e) => setQuickMarketId(e.target.value)}
                placeholder="Enter market UUID…"
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGoToMarket();
                }}
              />
              <Button onClick={handleGoToMarket} size="sm">
                Go to Quote Entry
              </Button>
            </div>
          </div>

          {/* Market search */}
          <div className="space-y-1.5">
            <label htmlFor="market-search" className="text-xs text-muted-foreground">
              Search markets by title
            </label>
            <input
              id="market-search"
              type="text"
              value={marketSearch}
              onChange={(e) => setMarketSearch(e.target.value)}
              placeholder="Search open markets…"
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {searchResults && searchResults.length > 0 && (
              <div className="rounded-md border border-border overflow-hidden divide-y divide-border mt-1">
                {searchResults.map((market) => (
                  <Link
                    key={market.id}
                    href={`/app/mm/markets/${encodeURIComponent(market.id)}`}
                    className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm truncate">{market.title}</span>
                    <span className="text-xs text-muted-foreground font-mono ml-3 shrink-0">
                      {market.id.slice(0, 8)}…
                    </span>
                  </Link>
                ))}
              </div>
            )}
            {searchResults?.length === 0 && marketSearch.length >= 2 && (
              <p className="text-xs text-muted-foreground pt-1">No markets found.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
