export type { ApiResponse } from "./markets";

export type OrderSide = "YES" | "NO";
export type OrderAction = "BUY" | "SELL";
export type OrderType = "LIMIT" | "MARKET";
export type OrderStatus =
  | "OPEN"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED"
  | "PENDING_TRIGGER";

export interface Order {
  id: string;
  marketId: string;
  marketTitle?: string;
  userId: string;
  side: OrderSide;
  action: OrderAction;
  type?: OrderType;
  priceCents: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: OrderStatus;
  triggerPriceCents?: number;
  heldAmountCents: number;
  feeCents?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  status?: OrderStatus | "ACTIVE";
  action?: OrderAction;
  from?: string;
  to?: string;
}

export interface WalletBalance {
  balanceCents: number;
  heldCents: number;
  availableCents: number;
}
