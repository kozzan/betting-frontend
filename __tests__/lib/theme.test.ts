import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSavedTheme,
  saveTheme,
  resolveTheme,
  applyTheme,
  getSystemTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

describe("getSavedTheme", () => {
  it("returns 'system' when nothing is stored", () => {
    expect(getSavedTheme()).toBe("system");
  });

  it("returns stored 'light' theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    expect(getSavedTheme()).toBe("light");
  });

  it("returns stored 'dark' theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    expect(getSavedTheme()).toBe("dark");
  });

  it("returns 'system' for an invalid stored value", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "invalid");
    expect(getSavedTheme()).toBe("system");
  });
});

describe("saveTheme", () => {
  it("writes the theme to localStorage", () => {
    saveTheme("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("overwrites a previously saved theme", () => {
    saveTheme("light");
    saveTheme("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});

describe("getSystemTheme", () => {
  it("returns 'light' when matchMedia does not match dark", () => {
    // setup.ts mocks matchMedia to return matches: false
    expect(getSystemTheme()).toBe("light");
  });

  it("returns 'dark' when matchMedia matches dark", () => {
    vi.mocked(globalThis.matchMedia).mockReturnValueOnce({
      matches: true,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    expect(getSystemTheme()).toBe("dark");
  });
});

describe("resolveTheme", () => {
  it("returns 'light' for light theme", () => {
    expect(resolveTheme("light")).toBe("light");
  });

  it("returns 'dark' for dark theme", () => {
    expect(resolveTheme("dark")).toBe("dark");
  });

  it("returns system preference for 'system'", () => {
    // matchMedia returns matches: false → "light"
    expect(resolveTheme("system")).toBe("light");
  });
});

describe("applyTheme", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("adds dark class for dark theme", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("removes dark class for light theme", () => {
    document.documentElement.classList.add("dark");
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("applies system preference (light by default in tests)", () => {
    applyTheme("system");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
