import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
import { decodeJwtPayload } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import { NavBar } from "@/components/NavBar";
import { OracleProfileCard } from "@/components/oracle/OracleProfileCard";
import { OracleMarketsList } from "@/components/oracle/OracleMarketsList";
import { Toaster } from "@/components/ui/sonner";
import type { OracleProfile } from "@/types/oracle";
import type { ApiResponse, MarketSummary, PagedResponse } from "@/types/markets";

interface PageProps {
  readonly params: Promise<{ id: string }>;
}

export default async function OracleProfilePage({ params }: PageProps) {
  const { id } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;
  const rawUsername = typeof decoded?.username === "string" ? decoded.username : null;
  const username = rawUsername ?? (typeof decoded?.sub === "string" ? decoded.sub : undefined);

  let profile: OracleProfile | null = null;
  try {
    const res = await apiRequest<ApiResponse<OracleProfile>>(
      `/api/v1/users/${id}/oracle-profile`,
      { skipAuth: true }
    );
    profile = res.data;
  } catch {
    // try unwrapped response
    try {
      profile = await apiRequest<OracleProfile>(
        `/api/v1/users/${id}/oracle-profile`,
        { skipAuth: true }
      );
    } catch {
      notFound();
    }
  }

  if (!profile) notFound();

  let markets: MarketSummary[] = [];
  try {
    const res = await apiRequest<ApiResponse<PagedResponse<MarketSummary>>>(
      `/api/v1/markets?oracle=${id}&size=20`,
      { skipAuth: true }
    );
    markets = res.data.content;
  } catch {
    // markets are optional; show empty list
  }

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar username={username} />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl space-y-6">
          <Link
            href="/app/markets"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to markets
          </Link>

          <OracleProfileCard profile={profile} />

          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Assigned Markets
            </h2>
            <OracleMarketsList markets={markets} />
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <p>All resolutions are verified by our admin team before being finalised.</p>
          </div>
        </div>
      </main>
      <Toaster />
    </div>
  );
}
