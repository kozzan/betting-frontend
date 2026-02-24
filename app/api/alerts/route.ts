import { NextRequest } from "next/server";
import { proxyGet, proxyPost } from "@/lib/proxy";

export async function GET() {
  return proxyGet("/api/v1/alerts");
}

export async function POST(req: NextRequest) {
  return proxyPost("/api/v1/alerts", await req.text());
}
