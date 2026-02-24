import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import type { PublicProfile } from "@/types/profile";

const baseProfile: PublicProfile = {
  userId: "u1",
  username: "apex_trader",
  memberSince: "2024-01-15T00:00:00Z",
  tradeCount: 42,
  publicPnl: true,
  pnlCents: 18750,
  winRate: 0.619,
};

describe("PublicProfileCard", () => {
  it("renders the username with @ prefix", () => {
    render(<PublicProfileCard profile={baseProfile} />);
    expect(screen.getByText("@apex_trader")).toBeInTheDocument();
  });

  it("shows the member since year", () => {
    render(<PublicProfileCard profile={baseProfile} />);
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it("shows the trade count", () => {
    render(<PublicProfileCard profile={baseProfile} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows P&L when publicPnl is true", () => {
    render(<PublicProfileCard profile={baseProfile} />);
    // $187.50
    expect(screen.getByText(/\+\$187\.50/)).toBeInTheDocument();
  });

  it("shows win rate when publicPnl is true", () => {
    render(<PublicProfileCard profile={baseProfile} />);
    expect(screen.getByText(/61\.9%/)).toBeInTheDocument();
  });

  it("shows 'Private' for P&L when publicPnl is false", () => {
    render(<PublicProfileCard profile={{ ...baseProfile, publicPnl: false }} />);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("applies emerald color class for positive P&L", () => {
    const { container } = render(<PublicProfileCard profile={baseProfile} />);
    const pnlEl = container.querySelector(".text-emerald-600, .text-emerald-500");
    expect(pnlEl).not.toBeNull();
  });

  it("applies red color class for negative P&L", () => {
    const { container } = render(
      <PublicProfileCard profile={{ ...baseProfile, pnlCents: -5000 }} />
    );
    const pnlEl = container.querySelector('[class*="text-red"]');
    expect(pnlEl).not.toBeNull();
  });
});
