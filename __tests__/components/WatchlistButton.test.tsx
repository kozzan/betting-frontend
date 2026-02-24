import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("@/hooks/useWatchlist", () => ({
  useWatchlist: vi.fn(),
}));

import { WatchlistButton } from "@/components/WatchlistButton";
import { useWatchlist } from "@/hooks/useWatchlist";

const mockUseWatchlist = vi.mocked(useWatchlist);

describe("WatchlistButton", () => {
  it("renders a button", () => {
    mockUseWatchlist.mockReturnValue({
      watchlist: [],
      isLoading: false,
      error: undefined,
      isWatched: () => false,
      addToWatchlist: vi.fn(),
      removeFromWatchlist: vi.fn(),
    });
    render(<WatchlistButton marketId="m1" />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows 'Add to watchlist' title when not watched", () => {
    mockUseWatchlist.mockReturnValue({
      watchlist: [],
      isLoading: false,
      error: undefined,
      isWatched: () => false,
      addToWatchlist: vi.fn(),
      removeFromWatchlist: vi.fn(),
    });
    render(<WatchlistButton marketId="m1" />);
    expect(screen.getByTitle("Add to watchlist")).toBeInTheDocument();
  });

  it("shows 'Remove from watchlist' title when watched", () => {
    mockUseWatchlist.mockReturnValue({
      watchlist: [],
      isLoading: false,
      error: undefined,
      isWatched: () => true,
      addToWatchlist: vi.fn(),
      removeFromWatchlist: vi.fn(),
    });
    render(<WatchlistButton marketId="m1" />);
    expect(screen.getByTitle("Remove from watchlist")).toBeInTheDocument();
  });

  it("calls addToWatchlist when not watched and clicked", async () => {
    const addToWatchlist = vi.fn().mockResolvedValue(undefined);
    mockUseWatchlist.mockReturnValue({
      watchlist: [],
      isLoading: false,
      error: undefined,
      isWatched: () => false,
      addToWatchlist,
      removeFromWatchlist: vi.fn(),
    });
    render(<WatchlistButton marketId="m1" />);
    fireEvent.click(screen.getByRole("button"));
    expect(addToWatchlist).toHaveBeenCalledWith("m1");
  });

  it("calls removeFromWatchlist when watched and clicked", async () => {
    const removeFromWatchlist = vi.fn().mockResolvedValue(undefined);
    mockUseWatchlist.mockReturnValue({
      watchlist: [],
      isLoading: false,
      error: undefined,
      isWatched: () => true,
      addToWatchlist: vi.fn(),
      removeFromWatchlist,
    });
    render(<WatchlistButton marketId="m1" />);
    fireEvent.click(screen.getByRole("button"));
    expect(removeFromWatchlist).toHaveBeenCalledWith("m1");
  });
});
