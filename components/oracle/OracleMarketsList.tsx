import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { MarketSummary, MarketStatus, Outcome } from "@/types/markets";

interface OracleMarketsListProps {
  readonly markets: MarketSummary[];
}

function statusVariant(status: MarketStatus): "default" | "secondary" | "outline" {
  if (status === "OPEN") return "default";
  if (status === "SETTLED") return "outline";
  return "secondary";
}

function outcomeVariant(outcome: Outcome): "default" | "destructive" | "secondary" {
  if (outcome === "YES") return "default";
  if (outcome === "NO") return "destructive";
  return "secondary";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
}

export function OracleMarketsList({ markets }: OracleMarketsListProps) {
  if (markets.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No markets assigned to this oracle yet.
      </p>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Market</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Category</th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Close Time</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {markets.map((market) => (
            <tr key={market.id} className="hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={`/app/markets/${market.id}`}
                  className="font-medium hover:underline line-clamp-2"
                >
                  {market.title}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-xs text-muted-foreground">
                  {market.category.charAt(0) + market.category.slice(1).toLowerCase()}
                </span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                {formatDate(market.closeTime)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={statusVariant(market.status)}>{market.status}</Badge>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
