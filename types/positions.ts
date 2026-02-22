export type PositionSide = "YES" | "NO";

export interface Position {
  positionId: string;
  marketId: string;
  marketTitle: string;
  side: PositionSide;
  quantity: number;
  averagePriceCents: number;
  realisedPnlCents: number;
  createdAt: string;
  updatedAt: string;
}
