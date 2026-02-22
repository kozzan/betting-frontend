export type { ApiResponse } from "./markets";

export type OrderSide = "YES" | "NO";
export type OrderAction = "BUY" | "SELL";
export type OrderStatus =
  | "OPEN"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED";

export interface Order {
  id: string;
  marketId: string;
  userId: string;
  side: OrderSide;
  action: OrderAction;
  priceCents: number;
  quantity: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: OrderStatus;
  heldAmountCents: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  balanceCents: number;
  heldCents: number;
  availableCents: number;
}
