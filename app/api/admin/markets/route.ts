import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  return proxyGet("/api/v1/markets", qs);
}
