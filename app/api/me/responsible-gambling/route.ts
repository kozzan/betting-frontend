import { proxyGet } from "@/lib/proxy";

export async function GET() {
  return proxyGet("/api/v1/me/responsible-gambling");
}
