"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConditionalOrderToggle } from "@/components/orders/ConditionalOrderToggle";
import type { ApiResponse, WalletBalance, Order, OrderAction, OrderSide, OrderStatus } from "@/types/orders";

interface PlaceOrderPanelProps {
  readonly marketId: string;
  readonly initialSide?: OrderSide;
  readonly onClose?: () => void;
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

export function PlaceOrderPanel({ marketId, initialSide = "YES", onClose }: PlaceOrderPanelProps) {
  const [side, setSide] = useState<OrderSide>(initialSide);
  const [action, setAction] = useState<OrderAction>("BUY");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isConditional, setIsConditional] = useState(false);
  const [triggerPriceCents, setTriggerPriceCents] = useState<number | null>(null);

  const { data: wallet, mutate: mutateWallet } = useSWR(
    "/api/wallet",
    walletFetcher,
    { refreshInterval: 30_000 }
  );

  const priceCents = Number.parseInt(price, 10);
  const qty = Number.parseInt(quantity, 10);
  const validPrice = !Number.isNaN(priceCents) && priceCents >= 1 && priceCents <= 99;
  const validQty = !Number.isNaN(qty) && qty >= 1;
  const validTrigger =
    !isConditional ||
    (triggerPriceCents !== null &&
      triggerPriceCents >= 1 &&
      triggerPriceCents <= 99);

  const rawEstimate = action === "BUY" ? priceCents * qty : (100 - priceCents) * qty;
  const estimatedCents = validPrice && validQty ? rawEstimate : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validPrice || !validQty || !validTrigger) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        marketId,
        side,
        action,
        priceCents,
        quantity: qty,
      };
      if (isConditional && triggerPriceCents !== null) {
        payload.triggerPriceCents = triggerPriceCents;
      }

      const res = await fetch("/api/orders", {
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

      const json: ApiResponse<Order> = await res.json();
      const order = json.data;
      toast.success(`Order placed — ${orderStatusMessage(order.status)}`);

      setPrice("");
      setQuantity("");
      setIsConditional(false);
      setTriggerPriceCents(null);
      mutateWallet().catch(() => {});
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <span className="text-sm font-medium">Place Order</span>
        {onClose && (
          <button
            type="button"
            aria-label="Close order panel"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        )}
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
              {(["YES", "NO"] as OrderSide[]).map((s) => {
                const activeClass = s === "YES"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-red-600 text-white shadow-sm";
                const sideClass = side === s ? activeClass : "text-muted-foreground hover:text-foreground";
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSide(s)}
                    className={`py-1.5 rounded text-sm font-medium transition-colors ${sideClass}`}
                  >
                    {s}
                  </button>
                );
              })}
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

          {/* Conditional order toggle */}
          <ConditionalOrderToggle
            isConditional={isConditional}
            triggerPriceCents={triggerPriceCents}
            orderAction={action}
            onConditionalChange={setIsConditional}
            onTriggerPriceChange={setTriggerPriceCents}
          />

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
            disabled={submitting || !validPrice || !validQty || !validTrigger}
            className="w-full"
          >
            {submitting ? "Placing…" : `${action} ${side}`}
          </Button>
        </form>
      </div>
    </div>
  );
}
