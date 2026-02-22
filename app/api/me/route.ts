import { NextRequest, NextResponse } from "next/server";
import { buildAuthHeaders } from "@/lib/proxy";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/v1/me`, {
      headers: await buildAuthHeaders(),
      next: { revalidate: 0 },
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 502 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.text();
    const res = await fetch(`${API_URL}/api/v1/me`, {
      method: "PATCH",
      headers: await buildAuthHeaders(),
      body,
      next: { revalidate: 0 },
    });
    const resBody = await res.text();
    return new NextResponse(resBody, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 502 });
  }
}
