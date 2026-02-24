import { NextRequest, NextResponse } from "next/server";
import { buildAuthHeaders } from "@/lib/proxy";
import type { LeaderboardEntry } from "@/types/leaderboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Mock data used as fallback when the backend endpoint is not yet implemented
function buildMockLeaderboard(): LeaderboardEntry[] {
  return [
    { rank: 1, userId: "u1", username: "apex_trader", pnlCents: 125400, tradeCount: 87, winRate: 0.724 },
    { rank: 2, userId: "u2", username: "probabilist", pnlCents: 98200, tradeCount: 134, winRate: 0.679 },
    { rank: 3, userId: "u3", username: "marketmover", pnlCents: 76800, tradeCount: 62, winRate: 0.645 },
    { rank: 4, userId: "u4", username: "edgeseeker", pnlCents: 54300, tradeCount: 201, winRate: 0.617 },
    { rank: 5, userId: "u5", username: "calibrated_q", pnlCents: 43100, tradeCount: 45, winRate: 0.711 },
    { rank: 6, userId: "u6", username: "bayesian_bob", pnlCents: 38900, tradeCount: 98, winRate: 0.592 },
    { rank: 7, userId: "u7", username: "forecaster99", pnlCents: 31200, tradeCount: 156, winRate: 0.571 },
    { rank: 8, userId: "u8", username: "quant_jenny", pnlCents: 22700, tradeCount: 77, winRate: 0.584 },
    { rank: 9, userId: "u9", username: "resolution_rx", pnlCents: 18400, tradeCount: 39, winRate: 0.641 },
    { rank: 10, userId: "u10", username: "contrarian_k", pnlCents: 12100, tradeCount: 112, winRate: 0.536 },
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const query = qs ? `?${qs}` : "";
  const backendPath = `/api/v1/leaderboard${query}`;

  try {
    const headers = await buildAuthHeaders();
    const res = await fetch(`${API_URL}${backendPath}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (res.status === 404 || res.status === 501) {
      // Backend endpoint not yet implemented — return mock data
      return NextResponse.json(buildMockLeaderboard());
    }

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Backend unreachable — return mock data so the UI is functional
    return NextResponse.json(buildMockLeaderboard());
  }
}
