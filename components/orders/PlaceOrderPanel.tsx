"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ApiResponse, WalletBalance, Order, OrderAction, OrderSide, OrderStatus } from "@/types/orders";

interface PlaceOrderPanelProps {
  readonly marketId: string;
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

function orderStatusMessage(status: OrderStatus): string {
  if (status === "FILLED") return "Fully filled";
  if (status === "PARTIALLY_FILLED") return "Partially filled";
  return "Open";
}

export function PlaceOrderPanel({ marketId }: PlaceOrderPanelProps) {
  const [side, setSide] = useState<OrderSide>("YES");
  const [action, setAction] = useState<OrderAction>("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: wallet, mutate: mutateWallet } = useSWR(
    "/api/wallet",
    walletFetcher,
    { refreshInterval: 30_000 }
  );

  const priceCents = parseInt(price, 10);
  const qty = parseInt(quantity, 10);
  const validPrice = !isNaN(priceCents) && priceCents >= 1 && priceCents <= 99;
  const validQty = !isNaN(qty) && qty >= 1;

  const estimatedCents =
    validPrice && validQty
      ? action === "BUY"
        ? priceCents * qty
        : (100 - priceCents) * qty
      : null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validPrice || !validQty) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketId, side, action, priceCents, quantity: qty }),
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

      const json: ApiResponse<Order> = await res.json();
      const order = json.data;
      toast.success(`Order placed — ${orderStatusMessage(order.status)}`);

      setPrice("");
      setQuantity("");
      void mutateWallet();
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
        {/* Wallet balance */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Available balance</span>
          <span className="font-medium tabular-nums">
            {wallet ? formatCents(wallet.availableCents) : "—"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Side toggle */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Outcome
            </Label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-muted">
              {(["YES", "NO"] as OrderSide[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSide(s)}
                  className={`py-1.5 rounded text-sm font-medium transition-colors ${
                    side === s
                      ? s === "YES"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-red-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

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
            <Label htmlFor="price" className="text-xs text-muted-foreground uppercase tracking-wide">
              Price (¢)
            </Label>
            <div className="relative">
              <Input
                id="price"
                type="number"
                min={1}
                max={99}
                step={1}
                placeholder="e.g. 65"
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
            <Label htmlFor="quantity" className="text-xs text-muted-foreground uppercase tracking-wide">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Estimated cost */}
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
            {submitting ? "Placing…" : `${action} ${side}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
