import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { decodeJwtPayload } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, Market } from "@/types/markets";
import { MMMarketPageClient } from "./MMMarketPageClient";

interface PageProps {
  readonly params: Promise<{ marketId: string }>;
}

export default async function MMMarketPage({ params }: PageProps) {
  const { marketId } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;

  if (decoded?.role !== "MARKET_MAKER") {
    notFound();
  }

  let market: Market | null = null;
  try {
    const res = await apiRequest<ApiResponse<Market>>(`/api/v1/markets/${marketId}`);
    market = res.data;
  } catch {
    // market not found
  }

  if (!market) notFound();

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Link
          href="/app/mm"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          MM Portal
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium truncate max-w-md">{market.title}</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold">Market Maker: {market.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Market ID: <span className="font-mono">{market.id}</span>
        </p>
      </div>

      <MMMarketPageClient marketId={market.id} />
    </div>
  );
}
