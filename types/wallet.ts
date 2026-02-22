export type TransactionType = "DEPOSIT" | "WITHDRAWAL";

export interface Transaction {
  id: string;
  type: TransactionType;
  amountCents: number;
  createdAt: string;
}
