export interface QuoteRequest {
  side: "YES" | "NO";
  action: "BUY" | "SELL";
  priceCents: number;
  quantity: number;
}

export interface BulkQuoteResult {
  results: Array<{
    orderId?: string;
    priceCents: number;
    quantity: number;
    success: boolean;
    errorMessage?: string;
  }>;
}
