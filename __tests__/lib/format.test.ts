import { describe, it, expect } from "vitest";
import { formatCents, formatDate, getErrorMessage } from "@/lib/format";

describe("formatCents", () => {
  it("formats positive cents as USD", () => {
    expect(formatCents(1050)).toBe("$10.50");
  });

  it("formats zero", () => {
    expect(formatCents(0)).toBe("$0.00");
  });

  it("formats negative cents (absolute value, no sign)", () => {
    expect(formatCents(-500)).toBe("$5.00");
  });

  it("shows + prefix for positive when signed", () => {
    expect(formatCents(500, true)).toBe("+$5.00");
  });

  it("shows - prefix for negative when signed", () => {
    expect(formatCents(-500, true)).toBe("-$5.00");
  });

  it("shows no sign for zero when signed", () => {
    expect(formatCents(0, true)).toBe("$0.00");
  });

  it("formats large amounts correctly", () => {
    expect(formatCents(100000)).toBe("$1,000.00");
  });
});

describe("formatDate", () => {
  it("returns a string containing the year", () => {
    const result = formatDate("2024-03-15T10:00:00Z");
    expect(result).toContain("2024");
  });

  it("returns a string containing a month abbreviation", () => {
    const result = formatDate("2024-03-15T10:00:00Z");
    expect(result).toMatch(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
  });

  it("handles ISO string with timezone", () => {
    expect(() => formatDate("2025-01-01T00:00:00Z")).not.toThrow();
  });
});

describe("getErrorMessage", () => {
  it("extracts message field from JSON body", async () => {
    const res = new Response(JSON.stringify({ message: "Bad input" }), { status: 400 });
    expect(await getErrorMessage(res)).toBe("Bad input");
  });

  it("falls back to error field when message absent", async () => {
    const res = new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
    expect(await getErrorMessage(res)).toBe("Forbidden");
  });

  it("falls back to status code when body is not JSON", async () => {
    const res = new Response("Not Found", { status: 404 });
    expect(await getErrorMessage(res)).toBe("Error 404");
  });

  it("falls back to status code when body is empty JSON", async () => {
    const res = new Response("{}", { status: 500 });
    expect(await getErrorMessage(res)).toBe("Error 500");
  });
});
