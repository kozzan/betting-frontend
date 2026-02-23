"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate, getErrorMessage } from "@/lib/format";
import type { MarketSummary } from "@/types/markets";

interface MyMarketsTableProps {
  readonly markets: MarketSummary[];
}

export function MyMarketsTable({ markets: initial }: MyMarketsTableProps) {
  const [markets, setMarkets] = useState(initial);

  async function handleDelete(id: string) {
    const snapshot = markets;
    setMarkets((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/markets/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        setMarkets(snapshot);
      } else {
        toast.success("Market deleted");
      }
    } catch {
      toast.error("Failed to delete market");
      setMarkets(snapshot);
    }
  }

  if (markets.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-8 text-center space-y-3">
        <p className="text-sm text-muted-foreground">You haven&apos;t created any markets yet.</p>
        <Button variant="outline" asChild>
          <Link href="/app/markets/create">Create your first market</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
              Category
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
              Closes
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {markets.map((market) => (
            <tr key={market.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium max-w-xs truncate">{market.title}</td>
              <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                {market.category}
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                {formatDate(market.closeTime)}
              </td>
              <td className="px-4 py-3">
                <Badge variant="secondary">DRAFT</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/app/markets/${market.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(market.id)}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
