import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cookies } from "next/headers";
import { isTokenExpired, decodeJwtPayload } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, Market } from "@/types/markets";
import { Badge } from "@/components/ui/badge";
import { OrderBook } from "@/components/markets/OrderBook";
import { MarketTradeSection } from "@/components/markets/MarketTradeSection";
import { PriceHistoryChart } from "@/components/markets/PriceHistoryChart";
import { MarketComments } from "@/components/markets/MarketComments";
import { MarketNews } from "@/components/markets/MarketNews";

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

function statusVariant(
  status: Market["status"]
): "default" | "secondary" | "outline" {
  if (status === "OPEN") return "default";
  if (status === "SETTLED") return "outline";
  return "secondary";
}

function outcomeVariant(
  outcome: Market["resolvedOutcome"]
): "default" | "secondary" | "destructive" {
  if (outcome === "YES") return "default";
  if (outcome === "NO") return "destructive";
  return "secondary";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export default async function MarketDetailPage({ params }: PageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const isAuthenticated = !!token && !isTokenExpired(token);
  const decoded = token ? decodeJwtPayload(token) : null;
  const currentUserId = typeof decoded?.sub === "string" ? decoded.sub : undefined;

  let market: Market;
  try {
    const res = await apiRequest<ApiResponse<Market>>(`/api/v1/markets/${id}`);
    market = res.data;
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/app/markets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to markets
      </Link>

      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusVariant(market.status)}>{market.status}</Badge>
            <Badge variant="outline">{market.category}</Badge>
            {market.resolvedOutcome && (
              <Badge variant={outcomeVariant(market.resolvedOutcome)}>
                Resolved: {market.resolvedOutcome}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold leading-snug">{market.title}</h1>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground mb-0.5">Closes</p>
            <p className="font-medium">{formatDate(market.closeTime)}</p>
          </div>
          {market.settlementTime && (
            <div>
              <p className="text-muted-foreground mb-0.5">Settled</p>
              <p className="font-medium">{formatDate(market.settlementTime)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {market.description && (
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {market.description}
            </p>
          </div>
        )}

        {/* Resolution criteria */}
        {market.resolutionCriteria && (
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Resolution criteria
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {market.resolutionCriteria}
            </p>
            <div className="flex flex-wrap gap-4 pt-1 text-sm">
              <Link
                href="/app/rules"
                className="text-primary hover:underline"
              >
                How resolution works &rarr;
              </Link>
              {safeUrl(market.resolutionSourceUrl) && (
                <a
                  href={safeUrl(market.resolutionSourceUrl)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Resolution source &rarr;
                </a>
              )}
            </div>
          </div>
        )}

        {/* Trading panel + Order book */}
        <div className="grid gap-4 lg:grid-cols-2">
          {market.status === "OPEN" && (
            <MarketTradeSection
              marketId={market.id}
              isAuthenticated={isAuthenticated}
              fromPath={`/app/markets/${market.id}`}
            />
          )}
          <div className={market.status === "OPEN" ? "" : "lg:col-span-2"}>
            <OrderBook marketId={market.id} />
          </div>
        </div>

        {/* Price History */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Price History
          </h2>
          <PriceHistoryChart marketId={market.id} />
        </div>

        {/* Discussion */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Discussion
          </h2>
          <MarketComments
            marketId={market.id}
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
          />
        </div>

        {/* Latest News */}
        <MarketNews marketId={market.id} />
      </div>
    </div>
  );
}
