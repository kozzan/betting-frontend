export type MarketStatus = "DRAFT" | "OPEN" | "CLOSED" | "SETTLED";
export type MarketCategory =
  | "CRYPTO"
  | "POLITICS"
  | "SPORTS"
  | "FINANCE"
  | "SCIENCE"
  | "ENTERTAINMENT"
  | "OTHER";
export type Outcome = "YES" | "NO" | "VOID";

export interface MarketSummary {
  id: string;
  slug: string;
  title: string;
  category: MarketCategory;
  status: MarketStatus;
  closeTime: string;
}

export interface Market {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: MarketCategory;
  status: MarketStatus;
  resolutionCriteria: string;
  resolutionSourceUrl?: string | null;
  closeTime: string;
  settlementTime: string | null;
  resolvedOutcome: Outcome | null;
  createdAt: string;
  updatedAt: string;
}

export interface PriceLevel {
  priceCents: number;
  totalQuantity: number;
}

export interface OrderBook {
  marketId: string;
  bids: PriceLevel[];
  asks: PriceLevel[];
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    requestId: string;
    timestamp: string;
  };
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface PricePoint {
  timestamp: string; // ISO 8601
  yesPct: number;    // 0–100
}

export interface MarketComment {
  id: string;
  marketId: string;
  userId: string;
  username: string;
  body: string;
  createdAt: string; // ISO 8601
}
