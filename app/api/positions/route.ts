import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const queryString = qs ? `?${qs}` : "";

  try {
    const res = await fetch(`${API_URL}/api/v1/positions${queryString}`, {
      headers,
      next: { revalidate: 0 },
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch positions" }, { status: 502 });
  }
}
