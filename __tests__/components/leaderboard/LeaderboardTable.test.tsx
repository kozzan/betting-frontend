import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LeaderboardTable, LeaderboardTableSkeleton } from "@/components/leaderboard/LeaderboardTable";
import type { LeaderboardEntry } from "@/types/leaderboard";

const entries: LeaderboardEntry[] = [
  { rank: 1, userId: "u1", username: "apex_trader", pnlCents: 50000, tradeCount: 120, winRate: 0.72 },
  { rank: 2, userId: "u2", username: "beta_markets", pnlCents: -10000, tradeCount: 60, winRate: 0.45 },
  { rank: 3, userId: "u3", username: "gamma_bet", pnlCents: 0, tradeCount: 30, winRate: 0.50 },
];

describe("LeaderboardTable", () => {
  it("shows empty state message when no entries", () => {
    render(<LeaderboardTable entries={[]} />);
    expect(screen.getByText(/No leaderboard data/)).toBeInTheDocument();
  });

  it("renders all entries", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText("apex_trader")).toBeInTheDocument();
    expect(screen.getByText("beta_markets")).toBeInTheDocument();
    expect(screen.getByText("gamma_bet")).toBeInTheDocument();
  });

  it("shows (you) label for current user", () => {
    render(<LeaderboardTable entries={entries} currentUserId="u2" />);
    expect(screen.getByText("(you)")).toBeInTheDocument();
  });

  it("does not show (you) label when no currentUserId", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.queryByText("(you)")).toBeNull();
  });

  it("shows positive P&L with + sign", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText("+$500.00")).toBeInTheDocument();
  });

  it("shows negative P&L with - sign", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText("-$100.00")).toBeInTheDocument();
  });

  it("shows win rates as percentages", () => {
    render(<LeaderboardTable entries={entries} />);
    expect(screen.getByText("72.0%")).toBeInTheDocument();
    expect(screen.getByText("45.0%")).toBeInTheDocument();
  });

  it("links each username to /profile/{username}", () => {
    render(<LeaderboardTable entries={entries} />);
    const link = screen.getByRole("link", { name: "apex_trader" });
    expect(link).toHaveAttribute("href", "/profile/apex_trader");
  });
});

describe("LeaderboardTableSkeleton", () => {
  it("renders 10 skeleton rows", () => {
    const { container } = render(<LeaderboardTableSkeleton />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(10);
  });

  it("renders skeleton pulse elements", () => {
    const { container } = render(<LeaderboardTableSkeleton />);
    const pulses = container.querySelectorAll(".animate-pulse");
    expect(pulses.length).toBeGreaterThan(0);
  });
});
