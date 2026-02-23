import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyGet(`/api/v1/markets/${id}/news`);
}
