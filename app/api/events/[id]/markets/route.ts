import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const qs = req.nextUrl.searchParams.toString();
  return proxyGet(`/api/v1/events/${id}/markets`, qs || undefined);
}
