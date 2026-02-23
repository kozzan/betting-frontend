import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyGet("/api/v1/wallet/transactions", req.nextUrl.searchParams.toString());
}
