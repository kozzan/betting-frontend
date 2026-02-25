import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyGet("/api/v1/positions", req.nextUrl.searchParams.toString());
}
