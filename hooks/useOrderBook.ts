"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Client, StompSubscription } from "@stomp/stompjs";
import type { OrderBook, PriceLevel } from "@/types/markets";
import { createStompClient } from "@/lib/websocket";

const REST_POLL_INTERVAL_MS = 5_000;

interface OrderBookState {
  bids: PriceLevel[];
  asks: PriceLevel[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

const INITIAL_STATE: OrderBookState = {
  bids: [],
  asks: [],
  isConnected: false,
  isLoading: true,
  error: null,
};

async function fetchOrderBook(marketId: string): Promise<OrderBook> {
  const res = await fetch(`/api/markets/${marketId}/orders`);
  if (!res.ok) throw new Error("Failed to load order book");
  const json = await res.json();
  return json.data as OrderBook;
}

async function fetchWsToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/ws-token");
    if (!res.ok) return null;
    const json = await res.json();
    return typeof json.token === "string" ? json.token : null;
  } catch {
    return null;
  }
}

export function useOrderBook(marketId: string): OrderBookState {
  const [state, setState] = useState<OrderBookState>(INITIAL_STATE);
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const isConnectedRef = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (id: string) => {
      stopPolling();
      pollTimerRef.current = setInterval(() => {
        if (isConnectedRef.current) {
          stopPolling();
          return;
        }
        fetchOrderBook(id).then((book) => {
          setState((prev) => ({
            ...prev,
            bids: book.bids,
            asks: book.asks,
          }));
        }).catch(() => {
          // polling error — keep existing data
        });
      }, REST_POLL_INTERVAL_MS);
    },
    [stopPolling]
  );

  const handleOrderBookMessage = useCallback(
    (message: { body: string }) => {
      try {
        const update: OrderBook = JSON.parse(message.body);
        setState((prev) => ({
          ...prev,
          bids: update.bids ?? prev.bids,
          asks: update.asks ?? prev.asks,
        }));
      } catch {
        // malformed message — ignore
      }
    },
    []
  );

  const connect = useCallback(
    async (token: string, id: string) => {
      const client = createStompClient(token);

      client.onConnect = () => {
        isConnectedRef.current = true;
        stopPolling();
        setState((prev) => ({ ...prev, isConnected: true }));

        subscriptionRef.current = client.subscribe(
          `/topic/markets/${id}/orderbook`,
          handleOrderBookMessage
        );
      };

      client.onDisconnect = () => {
        isConnectedRef.current = false;
        setState((prev) => ({ ...prev, isConnected: false }));
        // Fall back to REST polling when WS disconnects
        startPolling(id);
      };

      client.onStompError = () => {
        isConnectedRef.current = false;
        setState((prev) => ({ ...prev, isConnected: false }));
        startPolling(id);
      };

      clientRef.current = client;
      client.activate();
    },
    [handleOrderBookMessage, startPolling, stopPolling]
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setState(INITIAL_STATE);
      isConnectedRef.current = false;

      // 1. Fetch initial snapshot via REST
      try {
        const book = await fetchOrderBook(marketId);
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            bids: book.bids,
            asks: book.asks,
            isLoading: false,
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to load order book",
          }));
        }
        return;
      }

      // 2. Attempt WebSocket connection; fall back to REST polling if unavailable
      const token = await fetchWsToken();
      if (cancelled) return;

      if (token) {
        await connect(token, marketId);
      } else {
        // No WS token — poll REST for live updates
        startPolling(marketId);
      }
    }

    void init();

    return () => {
      cancelled = true;
      stopPolling();
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [marketId, connect, startPolling, stopPolling]);

  return state;
}
