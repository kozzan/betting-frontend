import Link from "next/link";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, MarketSummary } from "@/types/markets";
import { Badge } from "@/components/ui/badge";
import { WatchlistButton } from "@/components/WatchlistButton";
import { Button } from "@/components/ui/button";

interface WatchlistResponse {
  markets: MarketSummary[];
}

function formatCloseTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0) return `Closed ${date.toLocaleDateString()}`;
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays > 0) return `${diffDays}d left`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours > 0) return `${diffHours}h left`;
  const diffMins = Math.floor(diffMs / 60_000);
  return `${diffMins}m left`;
}

function statusVariant(
  status: MarketSummary["status"]
): "default" | "secondary" | "outline" {
  if (status === "OPEN") return "default";
  if (status === "SETTLED") return "outline";
  return "secondary";
}

export default async function WatchlistPage() {
  let markets: MarketSummary[] = [];
  try {
    const res = await apiRequest<ApiResponse<WatchlistResponse | MarketSummary[]>>(
      "/api/v1/watchlist"
    );
    const data = res.data;
    if (Array.isArray(data)) {
      markets = data;
    } else if ("markets" in data && Array.isArray(data.markets)) {
      markets = data.markets;
    }
  } catch {
    markets = [];
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Watchlist</h1>

      {markets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <p className="text-muted-foreground text-sm max-w-sm">
            You haven&apos;t added any markets to your watchlist yet. Browse
            markets and click the star icon to track ones you care about.
          </p>
          <Button asChild>
            <Link href="/app/markets">Browse markets</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Market</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Closes
                </th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {markets.map((market) => (
                <tr
                  key={market.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/markets/${market.id}`}
                      className="font-medium hover:underline line-clamp-2"
                    >
                      {market.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-muted-foreground text-xs">
                      {market.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {formatCloseTime(market.closeTime)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(market.status)}>
                      {market.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <WatchlistButton marketId={market.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
