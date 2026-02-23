import { NextRequest, NextResponse } from "next/server";
import { isTokenExpired } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ALWAYS allow internal Next.js assets and static files
  if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.endsWith('.ico')
  ) {
    return NextResponse.next();
  }

  // 2. Define your protected routes
  const protectedPaths = [
    "/app/orders",
    "/app/portfolio",
    "/app/wallet",
    "/app/profile",
    "/app/markets/create",
    "/app/my-markets",
    "/app/admin",
  ];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  // 3. Check auth ONLY for protected routes
  if (isProtected) {
    const token = request.cookies.get("access_token")?.value;

    if (!token || isTokenExpired(token)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Simplify the matcher to catch everything; the logic inside the function
// will handle the filtering more reliably than a complex regex.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], [cite: 1]
};