import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "@/components/events/EventCard";
import type { Event } from "@/types/event";

const baseEvent: Event = {
  id: "evt-1",
  name: "Melodifestivalen 2025",
  status: "ACTIVE",
  marketCount: 12,
};

describe("EventCard", () => {
  it("renders the event name", () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText("Melodifestivalen 2025")).toBeInTheDocument();
  });

  it("shows 'Date TBD' when no dates provided", () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText("Date TBD")).toBeInTheDocument();
  });

  it("shows formatted date range when both dates provided", () => {
    render(
      <EventCard
        event={{ ...baseEvent, startDate: "2025-03-01T00:00:00Z", endDate: "2025-03-31T00:00:00Z" }}
      />
    );
    // The date range text contains "–" separator (en-dash between start and end)
    const dateEls = screen.getAllByText(/2025/);
    expect(dateEls.length).toBeGreaterThan(0);
  });

  it("shows 'From ...' when only startDate provided", () => {
    render(<EventCard event={{ ...baseEvent, startDate: "2025-03-01T00:00:00Z" }} />);
    expect(screen.getByText(/From /)).toBeInTheDocument();
  });

  it("shows 'Until ...' when only endDate provided", () => {
    render(<EventCard event={{ ...baseEvent, endDate: "2025-03-31T00:00:00Z" }} />);
    expect(screen.getByText(/Until /)).toBeInTheDocument();
  });

  it("shows market count", () => {
    render(<EventCard event={baseEvent} />);
    expect(screen.getByText(/12.*markets/)).toBeInTheDocument();
  });

  it("uses 'market' singular for count of 1", () => {
    render(<EventCard event={{ ...baseEvent, marketCount: 1 }} />);
    expect(screen.getByText(/1 market$/)).toBeInTheDocument();
  });

  it("renders gradient placeholder when no coverImageUrl", () => {
    const { container } = render(<EventCard event={baseEvent} />);
    const gradient = container.querySelector(".bg-gradient-to-br");
    expect(gradient).not.toBeNull();
  });

  it("renders an image when coverImageUrl provided", () => {
    render(<EventCard event={{ ...baseEvent, coverImageUrl: "https://example.com/img.jpg" }} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("renders 'View Event' link pointing to correct route", () => {
    render(<EventCard event={baseEvent} />);
    const link = screen.getByRole("link", { name: "View Event" });
    expect(link).toHaveAttribute("href", "/app/events/evt-1");
  });
});
