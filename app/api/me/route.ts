import { NextRequest } from "next/server";
import { proxyGet, proxyPatch } from "@/lib/proxy";

export async function GET() {
  return proxyGet("/api/v1/me");
}

export async function PATCH(req: NextRequest) {
  return proxyPatch("/api/v1/me", await req.text());
}
