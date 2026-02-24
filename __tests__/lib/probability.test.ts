import { describe, it, expect } from "vitest";
import { calcImpliedProbability } from "@/lib/probability";
import type { OrderBook } from "@/types/markets";

function book(bids: number[], asks: number[]): OrderBook {
  return {
    marketId: "test",
    bids: bids.map((p) => ({ priceCents: p, totalQuantity: 10 })),
    asks: asks.map((p) => ({ priceCents: p, totalQuantity: 10 })),
  };
}

describe("calcImpliedProbability", () => {
  it("returns midpoint when both sides present", () => {
    expect(calcImpliedProbability(book([60], [70]))).toBe(65);
  });

  it("rounds midpoint correctly", () => {
    // (61 + 70) / 2 = 65.5 → rounds to 66
    expect(calcImpliedProbability(book([61], [70]))).toBe(66);
  });

  it("returns best bid when no asks", () => {
    expect(calcImpliedProbability(book([55], []))).toBe(55);
  });

  it("returns best ask when no bids", () => {
    expect(calcImpliedProbability(book([], [45]))).toBe(45);
  });

  it("returns null for empty book", () => {
    expect(calcImpliedProbability(book([], []))).toBeNull();
  });

  it("uses best bid (first element) not worst", () => {
    // bids sorted descending: best is 80, asks best is 85
    expect(calcImpliedProbability(book([80, 70, 60], [85, 90]))).toBe(83); // (80+85)/2 = 82.5 → 83
  });
});
