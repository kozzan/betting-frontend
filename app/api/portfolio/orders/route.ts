import { NextRequest } from "next/server";
import { proxyGet } from "@/lib/proxy";

export async function GET(req: NextRequest) {
  return proxyGet(
    "/api/v1/orders",
    req.nextUrl.searchParams.toString() ||
      "status=OPEN&status=PARTIALLY_FILLED&status=PENDING_TRIGGER&size=100&sort=createdAt,desc"
  );
}
