import { NextRequest } from "next/server";
import { proxyGet, proxyPost } from "@/lib/proxy";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  return proxyGet(`/api/v1/markets/${id}/comments`);
}

export async function POST(
  req: NextRequest,
  { params }: RouteContext
) {
  const { id } = await params;
  const body = await req.text();
  return proxyPost(`/api/v1/markets/${id}/comments`, body);
}
