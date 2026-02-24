export type ActivityEventType = "TRADE" | "MARKET_OPENED" | "MARKET_SETTLED";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  marketId: string;
  marketTitle: string;
  priceCents?: number;
  quantity?: number;
  outcome?: string;
  timestamp: string;
}
