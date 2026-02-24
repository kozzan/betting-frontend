"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Client, StompSubscription } from "@stomp/stompjs";
import type { OrderBook, PriceLevel } from "@/types/markets";
import { createStompClient } from "@/lib/websocket";

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

async function fetchInitialOrderBook(marketId: string): Promise<OrderBook> {
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
    async (token: string) => {
      const client = createStompClient(token);

      client.onConnect = () => {
        setState((prev) => ({ ...prev, isConnected: true }));

        subscriptionRef.current = client.subscribe(
          `/topic/markets/${marketId}/orderbook`,
          handleOrderBookMessage
        );
      };

      client.onDisconnect = () => {
        setState((prev) => ({ ...prev, isConnected: false }));
      };

      client.onStompError = () => {
        setState((prev) => ({ ...prev, isConnected: false }));
      };

      clientRef.current = client;
      client.activate();
    },
    [marketId, handleOrderBookMessage]
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setState(INITIAL_STATE);

      // 1. Fetch initial snapshot via REST
      try {
        const book = await fetchInitialOrderBook(marketId);
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

      // 2. Connect WebSocket for live updates
      const token = await fetchWsToken();
      if (token && !cancelled) {
        await connect(token);
      }
    }

    void init();

    return () => {
      cancelled = true;
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [marketId, connect]);

  return state;
}
