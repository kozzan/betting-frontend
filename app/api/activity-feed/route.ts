import { NextRequest, NextResponse } from "next/server";
import { buildAuthHeaders } from "@/lib/proxy";
import type { ActivityEvent } from "@/types/activity";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

function buildMockFeed(): ActivityEvent[] {
  const now = Date.now();
  return [
    {
      id: "a1",
      type: "TRADE",
      marketId: "mock-1",
      marketTitle: "Will Bitcoin reach $100k before end of 2025?",
      priceCents: 65,
      quantity: 50,
      timestamp: new Date(now - 45_000).toISOString(),
    },
    {
      id: "a2",
      type: "MARKET_OPENED",
      marketId: "mock-6",
      marketTitle: "Will the Fed cut rates in March 2026?",
      timestamp: new Date(now - 2 * 60_000).toISOString(),
    },
    {
      id: "a3",
      type: "TRADE",
      marketId: "mock-2",
      marketTitle: "Will the US enter a recession in 2025?",
      priceCents: 31,
      quantity: 200,
      timestamp: new Date(now - 4 * 60_000).toISOString(),
    },
    {
      id: "a4",
      type: "MARKET_SETTLED",
      marketId: "mock-4",
      marketTitle: "Will an AI model pass the bar exam by end of 2024?",
      outcome: "YES",
      timestamp: new Date(now - 8 * 60_000).toISOString(),
    },
    {
      id: "a5",
      type: "TRADE",
      marketId: "mock-3",
      marketTitle: "Will SpaceX land humans on Mars before 2030?",
      priceCents: 9,
      quantity: 1000,
      timestamp: new Date(now - 12 * 60_000).toISOString(),
    },
    {
      id: "a6",
      type: "TRADE",
      marketId: "mock-1",
      marketTitle: "Will Bitcoin reach $100k before end of 2025?",
      priceCents: 63,
      quantity: 75,
      timestamp: new Date(now - 18 * 60_000).toISOString(),
    },
    {
      id: "a7",
      type: "MARKET_OPENED",
      marketId: "mock-7",
      marketTitle: "Will GPT-5 launch before April 2026?",
      timestamp: new Date(now - 25 * 60_000).toISOString(),
    },
    {
      id: "a8",
      type: "TRADE",
      marketId: "mock-2",
      marketTitle: "Will the US enter a recession in 2025?",
      priceCents: 33,
      quantity: 120,
      timestamp: new Date(now - 35 * 60_000).toISOString(),
    },
  ];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const query = qs ? `?${qs}` : "";
  const backendPath = `/api/v1/activity-feed${query}`;

  try {
    const headers = await buildAuthHeaders();
    const res = await fetch(`${API_URL}${backendPath}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (res.status === 404 || res.status === 501) {
      return NextResponse.json(buildMockFeed());
    }

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(buildMockFeed());
  }
}
