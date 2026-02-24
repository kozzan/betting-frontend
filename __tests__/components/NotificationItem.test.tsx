import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationItem } from "@/components/NotificationItem";
import type { Notification } from "@/types/notification";

const baseNotification: Notification = {
  id: "n1",
  type: "ORDER_FILLED",
  title: "Order filled",
  message: "Your YES order was filled at 65¢",
  isRead: false,
  createdAt: new Date().toISOString(),
};

describe("NotificationItem", () => {
  it("renders the notification title", () => {
    render(<NotificationItem notification={baseNotification} />);
    expect(screen.getByText("Order filled")).toBeInTheDocument();
  });

  it("renders the notification message in non-compact mode", () => {
    render(<NotificationItem notification={baseNotification} />);
    expect(screen.getByText(/Your YES order was filled/)).toBeInTheDocument();
  });

  it("shows unread dot when isRead is false", () => {
    const { container } = render(<NotificationItem notification={baseNotification} />);
    const dot = container.querySelector(".rounded-full.bg-primary");
    expect(dot).not.toBeNull();
  });

  it("does not show unread dot when isRead is true", () => {
    const { container } = render(
      <NotificationItem notification={{ ...baseNotification, isRead: true }} />
    );
    const dot = container.querySelector(".rounded-full.bg-primary");
    expect(dot).toBeNull();
  });

  it("calls onClick when clicked", () => {
    const onClick = vi.fn();
    render(<NotificationItem notification={baseNotification} onClick={onClick} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders all notification types without throwing", () => {
    const types: Notification["type"][] = [
      "ORDER_FILLED",
      "ALERT_TRIGGERED",
      "MARKET_RESOLVED",
      "MARKET_CLOSING_SOON",
      "PLATFORM_ANNOUNCEMENT",
    ];
    types.forEach((type) => {
      expect(() =>
        render(<NotificationItem notification={{ ...baseNotification, type }} />)
      ).not.toThrow();
    });
  });

  it("compact mode truncates rather than clamp", () => {
    const { container } = render(
      <NotificationItem notification={baseNotification} compact />
    );
    const messageEl = container.querySelector(".truncate");
    expect(messageEl).not.toBeNull();
  });
});
