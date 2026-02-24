import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  return proxyPost("/api/v1/mm/cancel-replace", await req.text());
}
