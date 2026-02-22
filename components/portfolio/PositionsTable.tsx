"use client";

import Link from "next/link";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import type { Position } from "@/types/positions";
import type { ApiResponse, OrderBook } from "@/types/markets";
import { formatCents } from "@/lib/format";

interface PositionsTableProps {
  readonly positions: Position[];
}

async function orderBookFetcher(url: string): Promise<OrderBook> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Order book fetch failed: ${res.status} ${res.statusText} (${url})`);
  const json: ApiResponse<OrderBook> = await res.json();
  return json.data;
}

function UnrealisedPnl({
  position,
}: {
  readonly position: Position;
}) {
  const { data: book } = useSWR(
    position.quantity > 0 ? `/api/markets/${position.marketId}/orders` : null,
    orderBookFetcher,
    { refreshInterval: 30_000 }
  );

  if (!book) return <span className="text-muted-foreground">—</span>;

  let bestPriceCents: number | null = null;
  if (position.side === "YES" && book.bids.length > 0) {
    bestPriceCents = book.bids[0].priceCents;
  } else if (position.side === "NO" && book.asks.length > 0) {
    bestPriceCents = 100 - book.asks[0].priceCents;
  }

  if (bestPriceCents === null) return <span className="text-muted-foreground">—</span>;

  const unrealisedCents =
    (bestPriceCents - position.averagePriceCents) * position.quantity;

  let unrealisedColor = "text-muted-foreground";
  if (unrealisedCents > 0) unrealisedColor = "text-emerald-600";
  else if (unrealisedCents < 0) unrealisedColor = "text-red-600";

  return (
    <span className={`tabular-nums font-medium ${unrealisedColor}`}>
      {formatCents(unrealisedCents, true)}
    </span>
  );
}

export function PositionsTable({ positions }: PositionsTableProps) {
  if (positions.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground text-sm">
        No positions found.
      </p>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Market</th>
            <th className="text-left px-4 py-3 font-medium">Side</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
              Qty
            </th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
              Avg Price
            </th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
              Unrealised P&L
            </th>
            <th className="text-left px-4 py-3 font-medium">Realised P&L</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {positions.map((pos) => {
            let realisedColor = "text-muted-foreground";
            if (pos.realisedPnlCents > 0) realisedColor = "text-emerald-600";
            else if (pos.realisedPnlCents < 0) realisedColor = "text-red-600";

            return (
              <tr key={pos.positionId} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/app/markets/${pos.marketId}`}
                    className="hover:underline line-clamp-2 font-medium"
                  >
                    {pos.marketTitle}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={pos.side === "YES" ? "default" : "destructive"}>
                    {pos.side}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell tabular-nums text-muted-foreground">
                  {pos.quantity}
                </td>
                <td className="px-4 py-3 hidden md:table-cell tabular-nums text-muted-foreground">
                  {pos.averagePriceCents}¢
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <UnrealisedPnl position={pos} />
                </td>
                <td className="px-4 py-3">
                  <span className={`tabular-nums font-medium ${realisedColor}`}>
                    {formatCents(pos.realisedPnlCents, true)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
