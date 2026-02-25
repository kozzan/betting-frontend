"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import type { Position } from "@/types/positions";
import type { ApiResponse, OrderBook } from "@/types/markets";
import type { PositionSortKey } from "@/types/portfolio";
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

type SortDir = "asc" | "desc";

function sortPositions(
  positions: Position[],
  key: PositionSortKey,
  dir: SortDir
): Position[] {
  const sorted = [...positions].sort((a, b) => {
    if (key === "pnl") return a.realisedPnlCents - b.realisedPnlCents;
    if (key === "market") return a.marketTitle.localeCompare(b.marketTitle);
    if (key === "date") return a.createdAt.localeCompare(b.createdAt);
    return 0;
  });
  return dir === "desc" ? sorted.reverse() : sorted;
}

function SortButton({
  label,
  sortKey,
  activeKey,
  dir,
  onClick,
}: {
  readonly label: string;
  readonly sortKey: PositionSortKey;
  readonly activeKey: PositionSortKey;
  readonly dir: SortDir;
  readonly onClick: (key: PositionSortKey) => void;
}) {
  const isActive = sortKey === activeKey;
  return (
    <button
      onClick={() => onClick(sortKey)}
      className="flex items-center gap-1 font-medium hover:text-foreground transition-colors"
    >
      {label}
      {isActive && (
        <span className="text-xs opacity-60">{dir === "asc" ? "↑" : "↓"}</span>
      )}
    </button>
  );
}

export function PositionsTable({ positions }: PositionsTableProps) {
  const [sortKey, setSortKey] = useState<PositionSortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: PositionSortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  if (positions.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground text-sm">
        No positions found.
      </p>
    );
  }

  const sorted = sortPositions(positions, sortKey, sortDir);

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 text-muted-foreground">
              <SortButton
                label="Market"
                sortKey="market"
                activeKey={sortKey}
                dir={sortDir}
                onClick={handleSort}
              />
            </th>
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
            <th className="text-left px-4 py-3 text-muted-foreground">
              <SortButton
                label="Realised P&L"
                sortKey="pnl"
                activeKey={sortKey}
                dir={sortDir}
                onClick={handleSort}
              />
            </th>
            <th className="text-left px-4 py-3 text-muted-foreground hidden lg:table-cell">
              <SortButton
                label="Date"
                sortKey="date"
                activeKey={sortKey}
                dir={sortDir}
                onClick={handleSort}
              />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((pos) => {
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
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                  {new Date(pos.createdAt).toLocaleDateString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
