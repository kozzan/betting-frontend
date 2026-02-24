import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: vi.fn(),
}));

import { ThemeToggle } from "@/components/ThemeToggle";
import { useTheme } from "@/hooks/useTheme";

const mockUseTheme = vi.mocked(useTheme);

describe("ThemeToggle", () => {
  it("renders a button", () => {
    mockUseTheme.mockReturnValue({
      theme: "system",
      resolvedTheme: "light",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });
    render(<ThemeToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows 'Switch to dark mode' title when resolved theme is light", () => {
    mockUseTheme.mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });
    render(<ThemeToggle />);
    expect(screen.getByTitle("Switch to dark mode")).toBeInTheDocument();
  });

  it("shows 'Switch to light mode' title when resolved theme is dark", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: vi.fn(),
      toggleTheme: vi.fn(),
    });
    render(<ThemeToggle />);
    expect(screen.getByTitle("Switch to light mode")).toBeInTheDocument();
  });

  it("calls toggleTheme when clicked", () => {
    const toggleTheme = vi.fn();
    mockUseTheme.mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme: vi.fn(),
      toggleTheme,
    });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(toggleTheme).toHaveBeenCalledOnce();
  });
});
