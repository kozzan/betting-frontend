export interface MarketOutcome {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  resolved: boolean;
}

export interface PriceLevel {
  priceCents: number;
  quantity: number;
}

export interface OutcomeOrderBook {
  outcomeId: string;
  bids: PriceLevel[];
  asks: PriceLevel[];
}
