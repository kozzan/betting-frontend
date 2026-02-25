import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import type { OrderBook } from "@/types/markets";

// ----- STOMP mock -----
type FakeClient = {
  onConnect: (() => void) | null;
  onDisconnect: (() => void) | null;
  onStompError: (() => void) | null;
  activate: ReturnType<typeof vi.fn>;
  deactivate: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
  _subscribeHandler: ((msg: { body: string }) => void) | null;
};

let fakeClient: FakeClient;

vi.mock("@/lib/websocket", () => ({
  createStompClient: vi.fn(() => {
    fakeClient = {
      onConnect: null,
      onDisconnect: null,
      onStompError: null,
      _subscribeHandler: null,
      activate: vi.fn(function (this: FakeClient) {
        // Simulate async connect
        Promise.resolve().then(() => this.onConnect?.());
      }),
      deactivate: vi.fn(),
      subscribe: vi.fn((_topic: string, handler: (msg: { body: string }) => void) => {
        fakeClient._subscribeHandler = handler;
        return { unsubscribe: vi.fn() };
      }),
    };
    // bind activate to fakeClient
    fakeClient.activate = vi.fn(() => {
      Promise.resolve().then(() => fakeClient.onConnect?.());
    });
    return fakeClient;
  }),
}));

import { useOrderBook } from "@/hooks/useOrderBook";

const initialBook: OrderBook = {
  marketId: "m1",
  bids: [{ priceCents: 60, totalQuantity: 5 }],
  asks: [{ priceCents: 65, totalQuantity: 3 }],
};

function bookResponse(book: OrderBook) {
  return new Response(
    JSON.stringify({ data: book, meta: { requestId: "r1", timestamp: "" } }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

function wsTokenResponse(token: string | null) {
  return new Response(
    JSON.stringify(token ? { token } : {}),
    { status: token ? 200 : 403, headers: { "Content-Type": "application/json" } }
  );
}

describe("useOrderBook", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts in loading state", () => {
    vi.mocked(global.fetch).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useOrderBook("m1"));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.bids).toEqual([]);
    expect(result.current.asks).toEqual([]);
  });

  it("loads initial order book via REST", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))
      .mockResolvedValueOnce(wsTokenResponse(null)); // no WS token
    const { result } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.bids).toHaveLength(1);
    expect(result.current.bids[0].priceCents).toBe(60);
    expect(result.current.asks[0].priceCents).toBe(65);
  });

  it("sets isConnected to false when no WS token", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))
      .mockResolvedValueOnce(wsTokenResponse(null));
    const { result } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.isConnected).toBe(false);
  });

  it("connects WebSocket when WS token available", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))
      .mockResolvedValueOnce(wsTokenResponse("ws-token-123"));
    const { result } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isConnected).toBe(true));
  });

  it("updates bids and asks from WebSocket message", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))
      .mockResolvedValueOnce(wsTokenResponse("ws-token"));
    const { result } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    const update: OrderBook = {
      marketId: "m1",
      bids: [{ priceCents: 62, totalQuantity: 8 }],
      asks: [{ priceCents: 68, totalQuantity: 4 }],
    };

    act(() => {
      fakeClient._subscribeHandler?.({ body: JSON.stringify(update) });
    });

    expect(result.current.bids[0].priceCents).toBe(62);
    expect(result.current.asks[0].priceCents).toBe(68);
  });

  it("ignores malformed WebSocket messages", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))
      .mockResolvedValueOnce(wsTokenResponse("ws-token"));
    const { result } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    act(() => {
      fakeClient._subscribeHandler?.({ body: "not-json{{{" });
    });

    // Should retain original bids/asks
    expect(result.current.bids[0].priceCents).toBe(60);
  });

  it("sets error state when REST fetch fails", async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce(
      new Response("Error", { status: 500 })
    );
    const { result } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeTruthy();
  });

  it("calls deactivate on unmount", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))
      .mockResolvedValueOnce(wsTokenResponse("ws-token"));
    const { result, unmount } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isConnected).toBe(true));

    unmount();
    expect(fakeClient.deactivate).toHaveBeenCalled();
  });

  it("polls REST when no WS token is available", async () => {
    const updatedBook: OrderBook = {
      marketId: "m1",
      bids: [{ priceCents: 55, totalQuantity: 10 }],
      asks: [{ priceCents: 70, totalQuantity: 7 }],
    };

    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))  // initial REST load
      .mockResolvedValueOnce(wsTokenResponse(null))       // no WS token → start polling
      .mockResolvedValueOnce(bookResponse(updatedBook));  // first poll tick

    const { result } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // Advance timer to trigger first poll
    await act(async () => {
      vi.advanceTimersByTime(5_000);
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.bids[0].priceCents).toBe(55));
    expect(result.current.asks[0].priceCents).toBe(70);
  });

  it("stops polling on unmount when no WS token", async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce(bookResponse(initialBook))
      .mockResolvedValueOnce(wsTokenResponse(null));

    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { result, unmount } = renderHook(() => useOrderBook("m1"));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
