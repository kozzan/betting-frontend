"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponse, WalletBalance, OrderAction } from "@/types/orders";

interface PlaceOutcomeOrderPanelProps {
  readonly marketId: string;
  readonly outcomeId: string;
  readonly outcomeName: string;
}

async function walletFetcher(url: string): Promise<WalletBalance> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load wallet");
  const json: ApiResponse<WalletBalance> = await res.json();
  return json.data;
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

interface MultiOutcomeOrderResponse {
  id: string;
  status: string;
}

export function PlaceOutcomeOrderPanel({
  marketId,
  outcomeId,
  outcomeName,
}: PlaceOutcomeOrderPanelProps) {
  const [action, setAction] = useState<OrderAction>("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: wallet, mutate: mutateWallet } = useSWR(
    "/api/wallet",
    walletFetcher,
    { refreshInterval: 30_000 }
  );

  const priceCents = Number.parseInt(price, 10);
  const qty = Number.parseInt(quantity, 10);
  const validPrice = !Number.isNaN(priceCents) && priceCents >= 1 && priceCents <= 99;
  const validQty = !Number.isNaN(qty) && qty >= 1;

  const rawEstimate = action === "BUY" ? priceCents * qty : (100 - priceCents) * qty;
  const estimatedCents = validPrice && validQty ? rawEstimate : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validPrice || !validQty) return;

    setSubmitting(true);
    try {
      const payload = {
        marketId,
        outcomeId,
        action,
        priceCents,
        quantity: qty,
      };

      const res = await fetch("/api/orders/multi-outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const err = await res.json();
          message = err?.message ?? err?.error ?? message;
        } catch {
          // ignore parse error
        }
        toast.error(message);
        return;
      }

      const json: ApiResponse<MultiOutcomeOrderResponse> = await res.json();
      const order = json.data;
      const statusMsg =
        order.status === "FILLED"
          ? "Fully filled"
          : order.status === "PARTIALLY_FILLED"
          ? "Partially filled"
          : "Open";

      toast.success(`Order placed — ${statusMsg}`);
      setPrice("");
      setQuantity("");
      mutateWallet().catch(() => {});
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <span className="text-sm font-medium">Place Order</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Outcome context */}
        <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
          <span className="text-muted-foreground">Shares of: </span>
          <span className="font-medium">{outcomeName}</span>
        </div>

        {/* Wallet balance */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available balance</span>
          <span className="font-medium tabular-nums">
            {wallet ? formatCents(wallet.availableCents) : "—"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Action
            </Label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-muted">
              {(["BUY", "SELL"] as OrderAction[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={`py-1.5 rounded text-sm font-medium transition-colors ${
                    action === a
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <Label
              htmlFor="outcome-price"
              className="text-xs text-muted-foreground uppercase tracking-wide"
            >
              Price (¢)
            </Label>
            <div className="relative">
              <Input
                id="outcome-price"
                type="number"
                min={1}
                max={99}
                step={1}
                placeholder="e.g. 40"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ¢
              </span>
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label
              htmlFor="outcome-quantity"
              className="text-xs text-muted-foreground uppercase tracking-wide"
            >
              Quantity
            </Label>
            <Input
              id="outcome-quantity"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Estimated cost / proceeds */}
          {estimatedCents !== null && (
            <div className="flex items-center justify-between text-sm py-2 border-t border-border">
              <span className="text-muted-foreground">
                {action === "BUY" ? "Estimated cost" : "Max held"}
              </span>
              <span className="font-medium tabular-nums">
                {formatCents(estimatedCents)}
              </span>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting || !validPrice || !validQty}
            className="w-full"
          >
            {submitting ? "Placing…" : `${action} shares`}
          </Button>
        </form>
      </div>
    </div>
  );
}
