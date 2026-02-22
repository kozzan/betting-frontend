import { apiRequest } from "@/lib/api";
import type {
  ApiResponse,
  MarketCategory,
  MarketStatus,
  MarketSummary,
  PagedResponse,
} from "@/types/markets";
import { MarketsTable } from "@/components/markets/MarketsTable";

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
  const page = Math.max(0, parseInt(params.page ?? "0", 10));
  const q = params.q?.trim();

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
    <div>
      <h1 className="text-2xl font-semibold mb-6">Markets</h1>
      <MarketsTable
        markets={markets}
        currentStatus={status}
        currentCategory={category}
        currentPage={page}
        currentSearch={q}
      />
    </div>
  );
}
