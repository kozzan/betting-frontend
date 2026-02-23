"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/lib/format";
import type { MarketSummary } from "@/types/markets";

interface AdminMarketsTableProps {
  readonly markets: MarketSummary[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function AdminMarketsTable({ markets: initial }: AdminMarketsTableProps) {
  const [markets, setMarkets] = useState(initial);

  async function handleApprove(id: string) {
    const snapshot = markets;
    setMarkets((prev) => prev.filter((m) => m.id !== id));
    try {
      const res = await fetch(`/api/admin/markets/${id}/approve`, { method: "POST" });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        setMarkets(snapshot);
        return;
      }
      toast.success("Market approved");
    } catch {
      toast.error("Failed to approve market");
      setMarkets(snapshot);
    }
  }

  if (markets.length === 0) {
    return <p className="text-sm text-muted-foreground">No markets pending review.</p>;
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
              Creator
            </th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
              Closes
            </th>
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
                {market.createdBy ?? "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                {formatDate(market.closeTime)}
              </td>
              <td className="px-4 py-3">
                <Button size="sm" onClick={() => handleApprove(market.id)}>
                  Approve
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
