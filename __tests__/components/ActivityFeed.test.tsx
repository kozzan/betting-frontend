import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/hooks/useActivityFeed", () => ({
  useActivityFeed: vi.fn(),
}));

vi.mock("@/components/ActivityFeedItem", () => ({
  ActivityFeedItem: ({ event }: { event: { marketTitle: string } }) =>
    <div data-testid="feed-item">{event.marketTitle}</div>,
}));

import { ActivityFeed } from "@/components/ActivityFeed";
import { useActivityFeed } from "@/hooks/useActivityFeed";

const mockUseActivityFeed = vi.mocked(useActivityFeed);

describe("ActivityFeed", () => {
  it("shows skeleton while loading", () => {
    mockUseActivityFeed.mockReturnValue({ events: [], isLoading: true, error: null });
    const { container } = render(<ActivityFeed />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows empty state message when no events and not loading", () => {
    mockUseActivityFeed.mockReturnValue({ events: [], isLoading: false, error: null });
    render(<ActivityFeed />);
    expect(screen.getByText("No recent activity.")).toBeInTheDocument();
  });

  it("renders feed items when events are present", () => {
    mockUseActivityFeed.mockReturnValue({
      events: [
        { id: "e1", type: "TRADE", marketId: "m1", marketTitle: "BTC Market", priceCents: 65, quantity: 10, timestamp: new Date().toISOString() },
        { id: "e2", type: "MARKET_OPENED", marketId: "m2", marketTitle: "ETH Market", timestamp: new Date().toISOString() },
      ],
      isLoading: false,
      error: null,
    });
    render(<ActivityFeed />);
    expect(screen.getAllByTestId("feed-item")).toHaveLength(2);
    expect(screen.getByText("BTC Market")).toBeInTheDocument();
    expect(screen.getByText("ETH Market")).toBeInTheDocument();
  });

  it("shows header with 'Recent Activity'", () => {
    mockUseActivityFeed.mockReturnValue({ events: [], isLoading: false, error: null });
    render(<ActivityFeed />);
    expect(screen.getByText("Recent Activity")).toBeInTheDocument();
  });
});
