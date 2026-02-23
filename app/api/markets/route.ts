import { NextRequest } from "next/server";
import { proxyPost } from "@/lib/proxy";

export async function POST(req: NextRequest) {
  const body = await req.text();
  return proxyPost("/api/v1/markets", body);
}
