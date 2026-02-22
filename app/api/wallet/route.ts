import { NextResponse } from "next/server";
import { buildAuthHeaders } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/v1/wallet`, {
      headers: await buildAuthHeaders(),
      next: { revalidate: 0 },
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 502 });
  }
}
