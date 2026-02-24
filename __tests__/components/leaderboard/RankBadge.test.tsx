import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RankBadge } from "@/components/leaderboard/RankBadge";

describe("RankBadge", () => {
  it("shows #1 for rank 1", () => {
    render(<RankBadge rank={1} />);
    expect(screen.getByText("#1")).toBeInTheDocument();
  });

  it("shows #2 for rank 2", () => {
    render(<RankBadge rank={2} />);
    expect(screen.getByText("#2")).toBeInTheDocument();
  });

  it("shows #3 for rank 3", () => {
    render(<RankBadge rank={3} />);
    expect(screen.getByText("#3")).toBeInTheDocument();
  });

  it("has aria-label 'Rank 1' for rank 1", () => {
    render(<RankBadge rank={1} />);
    expect(screen.getByLabelText("Rank 1")).toBeInTheDocument();
  });

  it("has aria-label 'Rank 2' for rank 2", () => {
    render(<RankBadge rank={2} />);
    expect(screen.getByLabelText("Rank 2")).toBeInTheDocument();
  });

  it("shows plain number for rank 4+", () => {
    render(<RankBadge rank={4} />);
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("shows plain number for rank 100", () => {
    render(<RankBadge rank={100} />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("does not render medal span for rank 4+", () => {
    const { container } = render(<RankBadge rank={5} />);
    expect(container.querySelector("[aria-label]")).toBeNull();
  });
});
