import type { OrderBook } from "@/types/markets";

/**
 * Derives the implied YES probability (1–99) from the order book mid-price.
 * Falls back to best bid or best ask alone when only one side has orders.
 * Returns null when the book is empty.
 */
export function calcImpliedProbability(book: OrderBook): number | null {
  const bestBid = book.bids[0]?.priceCents ?? null;
  const bestAsk = book.asks[0]?.priceCents ?? null;

  if (bestBid !== null && bestAsk !== null) {
    return Math.round((bestBid + bestAsk) / 2);
  }
  if (bestBid !== null) return bestBid;
  if (bestAsk !== null) return bestAsk;
  return null;
}
