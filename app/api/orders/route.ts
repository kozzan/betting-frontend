import { NextRequest } from "next/server";
import { proxyGet, proxyPost } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyGet("/api/v1/orders", req.nextUrl.searchParams.toString());
}

export async function POST(req: NextRequest) {
  return proxyPost("/api/v1/orders", await req.text());
}
