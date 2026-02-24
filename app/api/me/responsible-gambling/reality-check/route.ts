import { type NextRequest } from "next/server";
import { proxyPatch } from "@/lib/proxy";

export async function PATCH(req: NextRequest) {
  return proxyPatch("/api/v1/me/responsible-gambling/reality-check", await req.text());
}
