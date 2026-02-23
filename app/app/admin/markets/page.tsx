import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { decodeJwtPayload } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, PagedResponse, MarketSummary } from "@/types/markets";
import { AdminMarketsTable } from "@/components/markets/AdminMarketsTable";

export default async function AdminMarketsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;

  if (decoded?.role !== "ADMIN") {
    notFound();
  }

  let markets: MarketSummary[] = [];
  try {
    const res = await apiRequest<ApiResponse<PagedResponse<MarketSummary>>>(
      "/api/v1/markets?status=DRAFT"
    );
    markets = res.data.content;
  } catch {
    // fall through to empty state
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Market Review Queue</h1>
      <AdminMarketsTable markets={markets} />
    </div>
  );
}
