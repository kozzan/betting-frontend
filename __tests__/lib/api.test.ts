import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mocks", () => ({
  USE_MOCK_DATA: false,
  getMockResponse: vi.fn().mockReturnValue(null),
}));

import { apiRequest } from "@/lib/api";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequest", () => {
  it("fetches and returns parsed JSON on success", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(jsonResponse({ value: 42 }));
    const result = await apiRequest<{ value: number }>("/test");
    expect(result).toEqual({ value: 42 });
  });

  it("calls the correct full URL", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(jsonResponse({}));
    await apiRequest("/some/path");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/some/path"),
      expect.any(Object)
    );
  });

  it("sets Content-Type application/json by default", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(jsonResponse({}));
    await apiRequest("/test");
    const call = vi.mocked(global.fetch).mock.calls[0];
    const headers = call[1]?.headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws on a non-ok response with message from body", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      jsonResponse({ message: "Market not found" }, 404)
    );
    await expect(apiRequest("/test")).rejects.toThrow("Market not found");
  });

  it("throws on a non-ok response with status when body has no message", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response("Internal Server Error", { status: 500 })
    );
    await expect(apiRequest("/test")).rejects.toThrow();
  });

  it("returns plain text for non-JSON content type", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response("hello world", { status: 200, headers: { "Content-Type": "text/plain" } })
    );
    const result = await apiRequest<string>("/test");
    expect(result).toBe("hello world");
  });

  it("retries after 401 when token refresh succeeds", async () => {
    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 })); // original fails
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 })); // refresh succeeds
    fetchMock.mockResolvedValueOnce(jsonResponse({ ok: true }));           // retry succeeds
    const result = await apiRequest<{ ok: boolean }>("/protected");
    expect(result).toEqual({ ok: true });
  });

  it("throws 'Session expired' and redirects when refresh fails", async () => {
    const locationSpy = { href: "/" };
    Object.defineProperty(globalThis, "window", {
      value: { ...globalThis.window, location: locationSpy },
      configurable: true,
    });

    const fetchMock = vi.mocked(global.fetch);
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 })); // refresh fails

    await expect(apiRequest("/protected")).rejects.toThrow("Session expired");
    expect(locationSpy.href).toBe("/login");
  });

  it("does not set Authorization when skipAuth is true", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(jsonResponse({}));
    await apiRequest("/public", { skipAuth: true });
    const call = vi.mocked(global.fetch).mock.calls[0];
    const headers = call[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });
});
