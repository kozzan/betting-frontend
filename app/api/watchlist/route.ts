import { proxyGet } from "@/lib/proxy";

export async function GET(): Promise<Response> {
  return proxyGet("/api/v1/watchlist");
}
