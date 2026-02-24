"use client";

import useSWR from "swr";
import type { ApiResponse, PagedResponse } from "@/types/markets";
import type { Order } from "@/types/orders";
import { OrderBook } from "@/components/markets/OrderBook";
import { MMOrdersTable } from "@/components/marketmaker/MMOrdersTable";
import { BulkQuoteForm } from "@/components/marketmaker/BulkQuoteForm";
import { CancelReplaceForm } from "@/components/marketmaker/CancelReplaceForm";
import { useMMOrders } from "@/hooks/useMMOrders";

interface MMMarketPageClientProps {
  readonly marketId: string;
}

async function fillHistoryFetcher(url: string): Promise<Order[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch fill history");
  const json: ApiResponse<PagedResponse<Order>> = await res.json();
  return json.data.content;
}

export function MMMarketPageClient({ marketId }: MMMarketPageClientProps) {
  const { orders, isLoading, cancelOrder, cancelAll, mutate } = useMMOrders(marketId);

  const { data: fillHistory, isLoading: fillsLoading } = useSWR<Order[]>(
    `/api/orders?marketId=${encodeURIComponent(marketId)}&status=FILLED&size=20&sort=updatedAt,desc`,
    fillHistoryFetcher,
    { refreshInterval: 30_000 }
  );

  return (
    <div className="space-y-8">
      {/* Order Book */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Live Order Book
        </h2>
        <div className="max-w-xl">
          <OrderBook marketId={marketId} />
        </div>
      </section>

      {/* Active MM Orders */}
      <section>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading orders…</p>
        ) : (
          <MMOrdersTable
            orders={orders}
            onCancelOrder={cancelOrder}
            onCancelAll={cancelAll}
          />
        )}
      </section>

      {/* Bulk Quote Entry */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Bulk Quote Entry
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Submit up to 10 quotes at once.
          </p>
        </div>
        <div className="rounded-md border border-border p-4">
          <BulkQuoteForm marketId={marketId} onSuccess={() => { mutate(); }} />
        </div>
      </section>

      {/* Cancel-Replace */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Cancel &amp; Replace
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Atomically cancel an existing order and place a new one.
          </p>
        </div>
        <div className="rounded-md border border-border p-4">
          <CancelReplaceForm
            marketId={marketId}
            orders={orders}
            onSuccess={() => { mutate(); }}
          />
        </div>
      </section>

      {/* Fill History */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Fill History (Last 20)
        </h2>

        {fillsLoading && (
          <p className="text-sm text-muted-foreground">Loading fills…</p>
        )}
        {!fillsLoading && (!fillHistory || fillHistory.length === 0) && (
          <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No fills on this market yet.
          </div>
        )}
        {!fillsLoading && fillHistory && fillHistory.length > 0 && (
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Side</th>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium tabular-nums">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                    Qty Filled
                  </th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                    Filled At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fillHistory.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          order.side === "YES"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {order.side}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {order.action}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-mono text-xs">
                      {order.priceCents}¢
                    </td>
                    <td className="px-4 py-3 tabular-nums text-xs hidden sm:table-cell">
                      {order.filledQuantity.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                      {new Intl.DateTimeFormat("en-US", {
                        dateStyle: "short",
                        timeStyle: "short",
                      }).format(new Date(order.updatedAt))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
