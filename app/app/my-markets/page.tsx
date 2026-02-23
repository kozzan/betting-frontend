import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, PagedResponse, MarketSummary } from "@/types/markets";
import { MyMarketsTable } from "@/components/markets/MyMarketsTable";

export default async function MyMarketsPage() {
  let markets: MarketSummary[] = [];
  try {
    const res = await apiRequest<ApiResponse<PagedResponse<MarketSummary>>>(
      "/api/v1/markets?createdBy=me&status=DRAFT&size=50"
    );
    markets = res.data.content;
  } catch (err) {
    console.error("Failed to load my markets:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Markets</h1>
        <Button asChild>
          <Link href="/app/markets/create">Create market</Link>
        </Button>
      </div>
      <MyMarketsTable markets={markets} />
    </div>
  );
}
