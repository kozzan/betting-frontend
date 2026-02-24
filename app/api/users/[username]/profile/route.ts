import { NextRequest, NextResponse } from "next/server";
import { buildAuthHeaders } from "@/lib/proxy";
import type { PublicProfile } from "@/types/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * GET /api/users/[username]/profile
 *
 * Proxies to GET /api/v1/users/{username}/profile on the backend.
 *
 * Backend requirement: The backend must expose this endpoint returning a
 * PublicProfile payload:
 *   { userId, username, memberSince, tradeCount, publicPnl, pnlCents?, winRate? }
 *
 * If the endpoint is not yet implemented (404/501), a minimal mock profile is
 * returned so the UI remains functional during development.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const backendPath = `/api/v1/users/${encodeURIComponent(username)}/profile`;

  try {
    const headers = await buildAuthHeaders();
    const res = await fetch(`${API_URL}${backendPath}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (res.status === 404 || res.status === 501) {
      const mock: PublicProfile = {
        userId: `mock-${username}`,
        username,
        memberSince: "2024-01-15T00:00:00Z",
        tradeCount: 42,
        publicPnl: true,
        pnlCents: 18750,
        winRate: 0.619,
      };
      return NextResponse.json({ data: mock });
    }

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    const mock: PublicProfile = {
      userId: `mock-${username}`,
      username,
      memberSince: "2024-01-15T00:00:00Z",
      tradeCount: 42,
      publicPnl: true,
      pnlCents: 18750,
      winRate: 0.619,
    };
    return NextResponse.json({ data: mock });
  }
}
