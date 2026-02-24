import { describe, it, expect } from "vitest";
import { MARKET_CATEGORIES, TEXTAREA_CLASS } from "@/lib/markets";

describe("MARKET_CATEGORIES", () => {
  it("is an array", () => {
    expect(Array.isArray(MARKET_CATEGORIES)).toBe(true);
  });

  it("contains expected categories", () => {
    expect(MARKET_CATEGORIES).toContain("CRYPTO");
    expect(MARKET_CATEGORIES).toContain("POLITICS");
    expect(MARKET_CATEGORIES).toContain("SPORTS");
    expect(MARKET_CATEGORIES).toContain("FINANCE");
    expect(MARKET_CATEGORIES).toContain("SCIENCE");
    expect(MARKET_CATEGORIES).toContain("ENTERTAINMENT");
    expect(MARKET_CATEGORIES).toContain("OTHER");
  });

  it("has exactly 7 categories", () => {
    expect(MARKET_CATEGORIES).toHaveLength(7);
  });
});

describe("TEXTAREA_CLASS", () => {
  it("is a non-empty string", () => {
    expect(typeof TEXTAREA_CLASS).toBe("string");
    expect(TEXTAREA_CLASS.length).toBeGreaterThan(0);
  });

  it("includes key Tailwind classes", () => {
    expect(TEXTAREA_CLASS).toContain("rounded-md");
    expect(TEXTAREA_CLASS).toContain("border");
    expect(TEXTAREA_CLASS).toContain("resize-none");
  });
});
