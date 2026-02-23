import { NextRequest, NextResponse } from "next/server";
import { isTokenExpired } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;

  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/app/orders/:path*",
    "/app/portfolio/:path*",
    "/app/wallet/:path*",
    "/app/profile/:path*",
    "/app/markets/create",
    "/app/markets/:path*/edit",
    "/app/my-markets/:path*",
    "/app/admin/:path*",
  ],
};
