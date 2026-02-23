import type { ApiResponse } from "@/types/markets";
import type { WalletBalance } from "@/types/orders";

export async function walletFetcher(url: string): Promise<WalletBalance> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Wallet fetch failed: ${res.status}`);
  const json: ApiResponse<WalletBalance> = await res.json();
  return json.data;
}
