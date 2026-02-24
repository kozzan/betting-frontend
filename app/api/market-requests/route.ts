import { NextRequest } from "next/server";
import { proxyPost, proxyGet } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyPost("/api/v1/market-requests", body);
}

export async function GET() {
  return proxyGet("/api/v1/market-requests/mine");
}
