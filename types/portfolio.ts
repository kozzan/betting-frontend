export type PositionSortKey = "pnl" | "market" | "date";

export interface PortfolioSummary {
  totalRealisedPnlCents: number;
  openPositionCount: number;
  costBasisCents: number;
}
