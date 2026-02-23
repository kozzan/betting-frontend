import { NextRequest, NextResponse } from "next/server";
import { proxyGet } from "@/lib/proxy";

const VALID_RANGES = new Set(["1H", "1D", "ALL"]);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rawRange = req.nextUrl.searchParams.get("range") ?? "1D";
  if (!VALID_RANGES.has(rawRange)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }
  return proxyGet(`/api/v1/markets/${id}/price-history`, `range=${rawRange}`);
}
