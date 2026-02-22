import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: IS_PRODUCTION,
  path: "/",
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const backendRes = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);

  if (!backendRes) {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }

  if (!backendRes.ok) {
    const err = await backendRes.json().catch(() => ({ message: "Registration failed" }));
    return NextResponse.json(err, { status: backendRes.status });
  }

  const data = await backendRes.json();
  const { accessToken, refreshToken } = data;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Invalid token response" }, { status: 502 });
  }

  const response = NextResponse.json({ ok: true }, { status: 201 });
  response.cookies.set("access_token", accessToken, { ...COOKIE_OPTIONS, maxAge: 15 * 60 });
  response.cookies.set("refresh_token", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 });
  return response;
}
