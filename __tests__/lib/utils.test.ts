import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("resolves tailwind conflicts — last wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes (false excluded)", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn(undefined, null, "class")).toBe("class");
  });

  it("handles object syntax from clsx", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });

  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("keeps non-conflicting classes", () => {
    const result = cn("flex", "items-center");
    expect(result).toContain("flex");
    expect(result).toContain("items-center");
  });

  it("merges text size conflicts", () => {
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });
});
