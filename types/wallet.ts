export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRADE";

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  createdAt: string;
}

export interface TransactionFilters {
  type?: TransactionType;
  from?: string;
  to?: string;
}
