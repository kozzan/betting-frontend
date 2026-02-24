import { type NextRequest } from "next/server";
import { proxyGet, proxyPatch } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  const qs = req.nextUrl.searchParams.toString();
  return proxyGet("/api/v1/notifications", qs || undefined);
}

export async function PATCH() {
  return proxyPatch("/api/v1/notifications/read-all", "{}");
}
