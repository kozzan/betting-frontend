import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mocks", () => ({
  USE_MOCK_DATA: false,
  getMockResponse: vi.fn().mockReturnValue(null),
}));

import { buildAuthHeaders, proxyGet, proxyPost, proxyPatch, proxyDelete } from "@/lib/proxy";
import { cookies } from "next/headers";

function makeBackendResponse(body: string, status = 200): Response {
  return new Response(body, { status, headers: { "Content-Type": "application/json" } });
}

describe("buildAuthHeaders", () => {
  it("returns Content-Type without Authorization when no token", async () => {
    const headers = await buildAuthHeaders();
    expect(headers).toMatchObject({ "Content-Type": "application/json" });
    expect((headers as Record<string, string>)["Authorization"]).toBeUndefined();
  });

  it("adds Authorization header when access_token cookie present", async () => {
    vi.mocked(cookies).mockResolvedValueOnce({
      get: vi.fn().mockReturnValue({ value: "my-jwt" }),
      set: vi.fn(),
      delete: vi.fn(),
      has: vi.fn().mockReturnValue(true),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    const headers = await buildAuthHeaders();
    expect((headers as Record<string, string>)["Authorization"]).toBe("Bearer my-jwt");
  });
});

describe("proxyGet", () => {
  it("returns 502 when backend fetch throws", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("Network error"));
    const res = await proxyGet("/api/v1/test");
    expect(res.status).toBe(502);
  });

  it("passes through backend status and body", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      makeBackendResponse('{"data":"ok"}', 200)
    );
    const res = await proxyGet("/api/v1/test");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('{"data":"ok"}');
  });

  it("appends query string when provided", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(makeBackendResponse("{}"));
    await proxyGet("/api/v1/test", "page=1&size=10");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("?page=1&size=10"),
      expect.any(Object)
    );
  });

  it("proxies 404 from backend", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(makeBackendResponse('{"error":"not found"}', 404));
    const res = await proxyGet("/api/v1/missing");
    expect(res.status).toBe(404);
  });
});

describe("proxyPost", () => {
  it("returns 502 when backend fetch throws", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("fail"));
    const res = await proxyPost("/api/v1/test", "{}");
    expect(res.status).toBe(502);
  });

  it("returns 204 response body as null", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(new Response(null, { status: 204 }));
    const res = await proxyPost("/api/v1/test", "{}");
    expect(res.status).toBe(204);
  });

  it("passes through 201 response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(makeBackendResponse('{"id":"new"}', 201));
    const res = await proxyPost("/api/v1/test", '{"name":"x"}');
    expect(res.status).toBe(201);
  });
});

describe("proxyPatch", () => {
  it("returns 502 on network error", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("fail"));
    const res = await proxyPatch("/api/v1/test", "{}");
    expect(res.status).toBe(502);
  });

  it("passes through 200 response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(makeBackendResponse('{"updated":true}'));
    const res = await proxyPatch("/api/v1/test", "{}");
    expect(res.status).toBe(200);
  });
});

describe("proxyDelete", () => {
  it("returns 502 on network error", async () => {
    vi.mocked(global.fetch).mockRejectedValueOnce(new Error("fail"));
    const res = await proxyDelete("/api/v1/test");
    expect(res.status).toBe(502);
  });

  it("passes through 200 response", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(makeBackendResponse("{}"));
    const res = await proxyDelete("/api/v1/test");
    expect(res.status).toBe(200);
  });
});
