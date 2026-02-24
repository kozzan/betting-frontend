import { cookies } from "next/headers";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { isTokenExpired } from "@/lib/auth";
import type {
  ApiResponse,
  MarketCategory,
  MarketStatus,
  MarketSummary,
  PagedResponse,
} from "@/types/markets";
import { MarketsTable } from "@/components/markets/MarketsTable";
import { Button } from "@/components/ui/button";
import { ActivityFeed } from "@/components/ActivityFeed";

interface SearchParams {
  status?: string;
  category?: string;
  page?: string;
  q?: string;
}

const EMPTY_PAGE: PagedResponse<MarketSummary> = {
  content: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 20,
};

export default async function MarketsPage({
  searchParams,
}: {
  readonly searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = (params.status as MarketStatus) ?? "OPEN";
  const category = params.category as MarketCategory | undefined;
  const page = Math.max(0, Number.parseInt(params.page ?? "0", 10));
  const q = params.q?.trim();

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const isAuthenticated = !!token && !isTokenExpired(token);

  const query = new URLSearchParams({ status, page: String(page), size: "20" });
  if (category) query.set("category", category);

  let markets: PagedResponse<MarketSummary>;
  try {
    const endpoint = q
      ? `/api/v1/markets/search?${query}&q=${encodeURIComponent(q)}`
      : `/api/v1/markets?${query}`;
    const res =
      await apiRequest<ApiResponse<PagedResponse<MarketSummary>>>(endpoint);
    markets = res.data;
  } catch {
    markets = EMPTY_PAGE;
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Markets</h1>
          {isAuthenticated && (
            <Button asChild variant="outline" size="sm">
              <Link href="/app/market-requests/new" className="flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4" />
                Request a Market
              </Link>
            </Button>
          )}
        </div>
        <MarketsTable
          markets={markets}
          currentStatus={status}
          currentCategory={category}
          currentPage={page}
          currentSearch={q}
        />
      </div>

      {/* Activity feed sidebar */}
      <aside className="w-72 shrink-0 hidden lg:block">
        <ActivityFeed />
      </aside>
    </div>
  );
}
