import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Comment out everything and just return next()
  return NextResponse.next();
}

// You can leave the config or comment it out too
export const config = {
  matcher: ['/((?!api|favicon.ico).*)'],
};