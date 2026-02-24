import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; outcomeId: string }> }
) {
  const { id, outcomeId } = await params;
  return proxyGet(`/api/v1/markets/${id}/outcomes/${outcomeId}/orderbook`);
}
