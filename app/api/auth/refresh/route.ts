import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: IS_PRODUCTION,
  path: "/",
};

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const backendRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null);

  if (!backendRes?.ok) {
    const response = NextResponse.json({ error: "Refresh failed" }, { status: 401 });
    response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
    response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
    return response;
  }

  const data = await backendRes.json();
  const { accessToken, refreshToken: newRefreshToken } = data;

  const response = NextResponse.json({ ok: true });
  response.cookies.set("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });
  response.cookies.set("refresh_token", newRefreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 });
  return response;
}
