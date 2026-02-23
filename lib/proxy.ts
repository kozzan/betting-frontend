import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export async function buildAuthHeaders(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

export async function proxyGet(backendPath: string, qs?: string): Promise<NextResponse> {
  const queryString = qs ? `?${qs}` : "";
  try {
    const res = await fetch(`${API_URL}${backendPath}${queryString}`, {
      headers: await buildAuthHeaders(),
      next: { revalidate: 0 },
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Proxy request failed" }, { status: 502 });
  }
}

export async function proxyPost(backendPath: string, body: string): Promise<NextResponse> {
  const headers = await buildAuthHeaders();
  try {
    const res = await fetch(`${API_URL}${backendPath}`, {
      method: "POST",
      headers,
      body,
      next: { revalidate: 0 },
    });
    if (res.status === 204) return new NextResponse(null, { status: 204 });
    const resBody = await res.text();
    return new NextResponse(resBody, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Proxy request failed" }, { status: 502 });
  }
}

export async function proxyPatch(backendPath: string, body: string): Promise<NextResponse> {
  const headers = await buildAuthHeaders();
  try {
    const res = await fetch(`${API_URL}${backendPath}`, {
      method: "PATCH",
      headers,
      body,
      next: { revalidate: 0 },
    });
    const resBody = await res.text();
    return new NextResponse(resBody, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Proxy request failed" }, { status: 502 });
  }
}

export async function proxyDelete(backendPath: string): Promise<NextResponse> {
  const headers = await buildAuthHeaders();
  try {
    const res = await fetch(`${API_URL}${backendPath}`, {
      method: "DELETE",
      headers,
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "Proxy request failed" }, { status: 502 });
  }
}
