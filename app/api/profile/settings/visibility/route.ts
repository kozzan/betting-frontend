import { NextRequest, NextResponse } from "next/server";
import { buildAuthHeaders } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/**
 * PATCH /api/profile/settings/visibility
 *
 * Body: { publicPnl: boolean }
 *
 * Proxies to PATCH /api/v1/me/settings/visibility on the backend.
 * Alternatively the backend may accept this as part of PATCH /api/v1/me.
 */
export async function PATCH(req: NextRequest) {
  const body = await req.text();

  try {
    const headers = await buildAuthHeaders();
    const res = await fetch(`${API_URL}/api/v1/me/settings/visibility`, {
      method: "PATCH",
      headers,
      body,
      next: { revalidate: 0 },
    });

    if (res.status === 404 || res.status === 501) {
      // Backend not yet implemented — acknowledge optimistically
      return NextResponse.json({ data: JSON.parse(body) });
    }

    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const resBody = await res.text();
    return new NextResponse(resBody, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Proxy request failed" }, { status: 502 });
  }
}
