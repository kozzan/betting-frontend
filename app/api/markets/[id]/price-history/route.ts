import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const range = req.nextUrl.searchParams.get("range") ?? "1D";
  return proxyGet(`/api/v1/markets/${id}/price-history`, `range=${range}`);
}
