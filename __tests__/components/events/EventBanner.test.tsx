import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventBanner } from "@/components/events/EventBanner";
import type { Event } from "@/types/event";

const baseEvent: Event = {
  id: "evt-1",
  name: "Grand Tournament",
  status: "ACTIVE",
  marketCount: 8,
};

describe("EventBanner", () => {
  it("renders the event name as a heading", () => {
    render(<EventBanner event={baseEvent} />);
    expect(screen.getByRole("heading", { name: "Grand Tournament" })).toBeInTheDocument();
  });

  it("shows market count", () => {
    render(<EventBanner event={baseEvent} />);
    expect(screen.getByText(/8.*markets/)).toBeInTheDocument();
  });

  it("uses singular 'market' when count is 1", () => {
    render(<EventBanner event={{ ...baseEvent, marketCount: 1 }} />);
    expect(screen.getByText(/1 market$/)).toBeInTheDocument();
  });

  it("shows gradient div when no coverImageUrl", () => {
    const { container } = render(<EventBanner event={baseEvent} />);
    const gradient = container.querySelector(".bg-gradient-to-br");
    expect(gradient).not.toBeNull();
  });

  it("renders an img when coverImageUrl is provided", () => {
    render(<EventBanner event={{ ...baseEvent, coverImageUrl: "https://example.com/cover.jpg" }} />);
    expect(screen.getByRole("img", { name: "Grand Tournament" })).toBeInTheDocument();
  });

  it("shows 'Date TBD' when no dates", () => {
    render(<EventBanner event={baseEvent} />);
    expect(screen.getByText("Date TBD")).toBeInTheDocument();
  });

  it("shows date range when both dates provided", () => {
    render(
      <EventBanner
        event={{ ...baseEvent, startDate: "2025-06-01T00:00:00Z", endDate: "2025-06-30T00:00:00Z" }}
      />
    );
    expect(screen.getByText(/2025/)).toBeInTheDocument();
  });
});
