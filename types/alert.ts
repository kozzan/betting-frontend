export type AlertDirection = "ABOVE" | "BELOW";
export type AlertStatus = "ACTIVE" | "TRIGGERED" | "CANCELLED";

export interface PriceAlert {
  id: string;
  marketId: string;
  marketTitle?: string;
  thresholdCents: number;
  direction: AlertDirection;
  status: AlertStatus;
  triggeredAt?: string;
  createdAt: string;
}
