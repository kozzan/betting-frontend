import { NextRequest } from "next/server";
import { proxyPatch } from "@/lib/proxy";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyPatch(`/api/v1/markets/${id}/status`, JSON.stringify({ status: "OPEN" }));
}
