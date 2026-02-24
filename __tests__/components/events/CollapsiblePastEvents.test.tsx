import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CollapsiblePastEvents } from "@/components/events/CollapsiblePastEvents";
import type { Event } from "@/types/event";

vi.mock("@/components/events/EventCard", () => ({
  EventCard: ({ event }: { event: Event }) => <div data-testid="event-card">{event.name}</div>,
}));

const events: Event[] = [
  { id: "e1", name: "Past Event 1", status: "INACTIVE", marketCount: 3 },
  { id: "e2", name: "Past Event 2", status: "INACTIVE", marketCount: 5 },
];

describe("CollapsiblePastEvents", () => {
  it("shows event count in the heading", () => {
    render(<CollapsiblePastEvents events={events} />);
    expect(screen.getByText("(2)")).toBeInTheDocument();
  });

  it("does not show events when collapsed (initial state)", () => {
    render(<CollapsiblePastEvents events={events} />);
    expect(screen.queryAllByTestId("event-card")).toHaveLength(0);
  });

  it("shows events after clicking heading to expand", () => {
    render(<CollapsiblePastEvents events={events} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getAllByTestId("event-card")).toHaveLength(2);
  });

  it("hides events again after clicking a second time (collapse)", () => {
    render(<CollapsiblePastEvents events={events} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(screen.queryAllByTestId("event-card")).toHaveLength(0);
  });

  it("shows event names when expanded", () => {
    render(<CollapsiblePastEvents events={events} />);
    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("Past Event 1")).toBeInTheDocument();
    expect(screen.getByText("Past Event 2")).toBeInTheDocument();
  });

  it("renders with zero events", () => {
    render(<CollapsiblePastEvents events={[]} />);
    expect(screen.getByText("(0)")).toBeInTheDocument();
  });
});
