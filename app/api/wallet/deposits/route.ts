import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  return proxyPost("/api/v1/wallet/deposits", await req.text());
}
