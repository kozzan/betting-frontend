import { NextRequest, NextResponse } from "next/server";
import { isTokenExpired } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Skip middleware for internal Next.js files and static assets
  if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Auth logic for your app routes
  const token = request.cookies.get("access_token")?.value;

  if (!token || isTokenExpired(token)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// This matcher tells Next.js which paths should trigger the middleware
export const config = {
  matcher: [
    "/app/:path*", // Protect all routes starting with /app
  ],
};