import { getMockResponse, USE_MOCK_DATA } from "@/lib/mocks";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

type FetchOptions = RequestInit & {
  skipAuth?: boolean;
};

async function getAccessToken(): Promise<string | null> {
  if (typeof globalThis.window === "undefined") {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get("access_token")?.value ?? null;
  }
  return null;
}

async function refreshTokens(): Promise<boolean> {
  const res = await fetch("/api/auth/refresh", { method: "POST" });
  return res.ok;
}

async function handle401(
  path: string,
  fetchOptions: RequestInit,
  headers: Headers
): Promise<Response> {
  const refreshed = await refreshTokens();
  if (!refreshed) {
    if (typeof globalThis.window !== "undefined") {
      globalThis.window.location.href = "/login";
    }
    throw new Error("Session expired");
  }
  const newToken = await getAccessToken();
  if (newToken) {
    headers.set("Authorization", `Bearer ${newToken}`);
  }
  return fetch(`${API_URL}${path}`, { ...fetchOptions, headers });
}

export async function apiRequest<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  if (USE_MOCK_DATA) {
    const mock = getMockResponse(path);
    if (mock !== null) return mock as T;
  }

  const { skipAuth = false, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (!headers.has("Content-Type") && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = await getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let res = await fetch(`${API_URL}${path}`, { ...fetchOptions, headers });

  if (res.status === 401 && !skipAuth) {
    res = await handle401(path, fetchOptions, headers);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Request failed: ${res.status}`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return res.json() as Promise<T>;
  }
  return res.text() as unknown as Promise<T>;
}
