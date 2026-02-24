import "@testing-library/jest-dom";
import { vi, beforeEach } from "vitest";
import React from "react";

// --------------------------------------------------------------------------
// Global fetch mock — reset to a fresh vi.fn() before each test
// --------------------------------------------------------------------------
global.fetch = vi.fn();

// --------------------------------------------------------------------------
// next/navigation
// --------------------------------------------------------------------------
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: vi.fn(),
  notFound: vi.fn(),
}));

// --------------------------------------------------------------------------
// next/image — render a plain <img>
// --------------------------------------------------------------------------
vi.mock("next/image", () => ({
  default: ({ src, alt, fill: _fill, sizes: _sizes, ...rest }: Record<string, unknown>) =>
    React.createElement("img", { src, alt, ...rest }),
}));

// --------------------------------------------------------------------------
// next/link — passthrough anchor
// --------------------------------------------------------------------------
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: Record<string, unknown>) =>
    React.createElement("a", { href, ...rest }, children as React.ReactNode),
}));

// --------------------------------------------------------------------------
// next/headers — cookies() returns a minimal store
// --------------------------------------------------------------------------
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
    set: vi.fn(),
    delete: vi.fn(),
    has: vi.fn().mockReturnValue(false),
  }),
}));

// --------------------------------------------------------------------------
// window.matchMedia — not provided by jsdom
// --------------------------------------------------------------------------
Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// --------------------------------------------------------------------------
// localStorage — bun's runtime provides a partial implementation without .clear()
// Replace with a full in-memory mock so all tests have a consistent store.
// --------------------------------------------------------------------------
const localStorageStore: Record<string, string> = {};
const localStorageMock: Storage = {
  getItem: (key: string) => localStorageStore[key] ?? null,
  setItem: (key: string, value: string) => { localStorageStore[key] = value; },
  removeItem: (key: string) => { delete localStorageStore[key]; },
  clear: () => { Object.keys(localStorageStore).forEach((k) => delete localStorageStore[k]); },
  get length() { return Object.keys(localStorageStore).length; },
  key: (i: number) => Object.keys(localStorageStore)[i] ?? null,
};
vi.stubGlobal("localStorage", localStorageMock);

// --------------------------------------------------------------------------
// Reset between tests
// --------------------------------------------------------------------------
beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
  global.fetch = vi.fn();
});
