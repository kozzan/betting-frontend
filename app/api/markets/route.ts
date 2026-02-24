import { NextRequest } from "next/server";
import { proxyGet, proxyPost } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  const q = req.nextUrl.searchParams.get("q");
  const path = q ? "/api/v1/markets/search" : "/api/v1/markets";
  return proxyGet(path, qs);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyPost("/api/v1/markets", body);
}
