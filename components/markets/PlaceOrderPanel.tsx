"use client";

import { useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MarketType, ApiResponse } from "@/types/markets";
import type { Order, OrderSide, WalletBalance } from "@/types/orders";

type OrderType = "LIMIT" | "MARKET";

interface PlaceOrderPanelProps {
  readonly marketId: string;
  readonly marketType: MarketType;
}

interface FormErrors {
  price?: string;
  quantity?: string;
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

function validate(
  orderType: OrderType,
  price: string,
  quantity: string
): FormErrors {
  const errors: FormErrors = {};
  const qty = Number.parseInt(quantity, 10);

  if (orderType === "LIMIT") {
    const priceCents = Number.parseInt(price, 10);
    if (!price.trim()) {
      errors.price = "Price is required for limit orders";
    } else if (Number.isNaN(priceCents) || priceCents < 1 || priceCents > 99) {
      errors.price = "Price must be between 1¢ and 99¢";
    }
  }

  if (!quantity.trim()) {
    errors.quantity = "Quantity is required";
  } else if (Number.isNaN(qty) || qty < 1) {
    errors.quantity = "Quantity must be at least 1";
  }

  return errors;
}

export function PlaceOrderPanel({ marketId, marketType }: PlaceOrderPanelProps) {
  const [side, setSide] = useState<OrderSide>("YES");
  const [orderType, setOrderType] = useState<OrderType>("LIMIT");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const { data: wallet, mutate: mutateWallet } = useSWR<WalletBalance>(
    "/api/wallet",
    walletFetcher,
    { refreshInterval: 30_000 }
  );

  const priceCents = Number.parseInt(price, 10);
  const qty = Number.parseInt(quantity, 10);
  const validPrice = !Number.isNaN(priceCents) && priceCents >= 1 && priceCents <= 99;
  const validQty = !Number.isNaN(qty) && qty >= 1;

  const estimatedCostCents =
    orderType === "LIMIT" && validPrice && validQty ? priceCents * qty : null;
  const maxPayoutCents =
    orderType === "LIMIT" && validPrice && validQty ? 100 * qty : null;

  // For market orders, show qty-based estimate only if qty is valid
  const marketEstimateCents = orderType === "MARKET" && validQty ? qty * 100 : null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formErrors = validate(orderType, price, quantity);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        marketId,
        side,
        action: "BUY",
        quantity: qty,
        orderType,
      };

      if (orderType === "LIMIT") {
        payload.priceCents = priceCents;
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
          message = (err?.message ?? err?.error ?? message) as string;
        } catch {
          // ignore parse error
        }
        toast.error(message);
        return;
      }

      const json: ApiResponse<Order> = await res.json();
      const order = json.data;
      const statusLabel =
        order.status === "FILLED"
          ? "Fully filled"
          : order.status === "PARTIALLY_FILLED"
            ? "Partially filled"
            : "Open";
      toast.success(`Order placed — ${statusLabel}`);

      setPrice("");
      setQuantity("");
      setErrors({});
      mutateWallet().catch(() => {});
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isBinary = marketType === "BINARY";

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

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* YES/NO tab selector — only for binary markets */}
          {isBinary && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Outcome
              </Label>
              <Tabs
                value={side}
                onValueChange={(v) => setSide(v as OrderSide)}
                className="w-full"
              >
                <TabsList className="w-full">
                  <TabsTrigger
                    value="YES"
                    className="flex-1 data-[state=active]:bg-emerald-600 data-[state=active]:text-white"
                  >
                    YES
                  </TabsTrigger>
                  <TabsTrigger
                    value="NO"
                    className="flex-1 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                  >
                    NO
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          {/* Order type toggle: Limit vs Market */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Order type
            </Label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-muted">
              {(["LIMIT", "MARKET"] as OrderType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setOrderType(t);
                    setErrors({});
                  }}
                  className={`py-1.5 rounded text-sm font-medium transition-colors ${
                    orderType === t
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "LIMIT" ? "Limit" : "Market"}
                </button>
              ))}
            </div>
          </div>

          {/* Price — only for limit orders */}
          {orderType === "LIMIT" && (
            <div className="space-y-1.5">
              <Label
                htmlFor="place-order-price"
                className="text-xs text-muted-foreground uppercase tracking-wide"
              >
                Price (¢)
              </Label>
              <div className="relative">
                <Input
                  id="place-order-price"
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  placeholder="e.g. 65"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  aria-invalid={!!errors.price}
                  aria-describedby={errors.price ? "place-order-price-error" : undefined}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  ¢
                </span>
              </div>
              {errors.price && (
                <p id="place-order-price-error" className="text-xs text-destructive">
                  {errors.price}
                </p>
              )}
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-1.5">
            <Label
              htmlFor="place-order-quantity"
              className="text-xs text-muted-foreground uppercase tracking-wide"
            >
              Quantity
            </Label>
            <Input
              id="place-order-quantity"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 10"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                if (errors.quantity) setErrors((prev) => ({ ...prev, quantity: undefined }));
              }}
              aria-invalid={!!errors.quantity}
              aria-describedby={errors.quantity ? "place-order-quantity-error" : undefined}
            />
            {errors.quantity && (
              <p id="place-order-quantity-error" className="text-xs text-destructive">
                {errors.quantity}
              </p>
            )}
          </div>

          {/* Cost / payout summary */}
          {(estimatedCostCents !== null || marketEstimateCents !== null) && (
            <div className="space-y-1 py-2 border-t border-border text-sm">
              {orderType === "LIMIT" && estimatedCostCents !== null && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated cost</span>
                    <span className="font-medium tabular-nums">
                      {formatCents(estimatedCostCents)}
                    </span>
                  </div>
                  {maxPayoutCents !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Max payout</span>
                      <span className="font-medium tabular-nums text-emerald-600">
                        {formatCents(maxPayoutCents)}
                      </span>
                    </div>
                  )}
                </>
              )}
              {orderType === "MARKET" && marketEstimateCents !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Max cost (market)</span>
                  <span className="font-medium tabular-nums">
                    {formatCents(marketEstimateCents)}
                  </span>
                </div>
              )}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting
              ? "Placing…"
              : `Buy ${isBinary ? side : "shares"} (${orderType === "LIMIT" ? "Limit" : "Market"})`}
          </Button>
        </form>
      </div>
    </div>
  );
}
