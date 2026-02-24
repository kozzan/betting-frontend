"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Order } from "@/types/orders";
import type { QuoteRequest } from "@/types/marketmaker";

interface CancelReplaceFormProps {
  readonly marketId: string;
  readonly orders: Order[];
  readonly onSuccess: () => void;
}

export function CancelReplaceForm({
  marketId,
  orders,
  onSuccess,
}: CancelReplaceFormProps) {
  const [existingOrderId, setExistingOrderId] = useState<string>("");
  const [newQuote, setNewQuote] = useState<QuoteRequest>({
    side: "YES",
    action: "BUY",
    priceCents: 50,
    quantity: 100,
  });
  const [submitting, setSubmitting] = useState(false);

  const activeOrders = orders.filter(
    (o) => o.status === "OPEN" || o.status === "PARTIALLY_FILLED"
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!existingOrderId) {
      toast.error("Select an order to replace");
      return;
    }

    const p = Number(newQuote.priceCents);
    if (!Number.isInteger(p) || p < 1 || p > 99) {
      toast.error("Price must be between 1 and 99 cents");
      return;
    }
    const q = Number(newQuote.quantity);
    if (!Number.isInteger(q) || q < 1) {
      toast.error("Quantity must be a positive integer");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/mm/cancel-replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId,
          existingOrderId,
          newQuote: {
            side: newQuote.side,
            action: newQuote.action,
            priceCents: p,
            quantity: q,
          },
        }),
      });

      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const body = await res.json();
          message = body?.message ?? body?.error ?? message;
        } catch {
          // ignore
        }
        toast.error(message);
        return;
      }

      toast.success("Order replaced successfully");
      setExistingOrderId("");
      setNewQuote({ side: "YES", action: "BUY", priceCents: 50, quantity: 100 });
      onSuccess();
    } catch {
      toast.error("Failed to replace order");
    } finally {
      setSubmitting(false);
    }
  }

  function updateQuote(field: keyof QuoteRequest, value: string | number) {
    setNewQuote((prev) => ({ ...prev, [field]: value }));
  }

  if (activeOrders.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        No active orders available to replace.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Existing order selector */}
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Select Order to Replace
        </Label>
        <select
          value={existingOrderId}
          onChange={(e) => setExistingOrderId(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          disabled={submitting}
          required
        >
          <option value="">— select an order —</option>
          {activeOrders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.action} {o.side} @ {o.priceCents}¢ &times;{" "}
              {o.remainingQuantity} rem ({o.id.slice(0, 8)}…)
            </option>
          ))}
        </select>
      </div>

      {/* New quote fields */}
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">
          Replacement Quote
        </Label>
        <div className="grid grid-cols-[80px_80px_90px_90px] gap-2">
          <div className="space-y-1">
            <Label className="text-xs">Side</Label>
            <select
              value={newQuote.side}
              onChange={(e) => updateQuote("side", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={submitting}
            >
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Action</Label>
            <select
              value={newQuote.action}
              onChange={(e) => updateQuote("action", e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              disabled={submitting}
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price (¢)</Label>
            <Input
              type="number"
              min={1}
              max={99}
              step={1}
              value={newQuote.priceCents}
              onChange={(e) => updateQuote("priceCents", e.target.value)}
              className="h-9 text-sm tabular-nums"
              disabled={submitting}
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Quantity</Label>
            <Input
              type="number"
              min={1}
              step={1}
              value={newQuote.quantity}
              onChange={(e) => updateQuote("quantity", e.target.value)}
              className="h-9 text-sm tabular-nums"
              disabled={submitting}
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" size="sm" disabled={submitting}>
        {submitting ? "Replacing…" : "Replace Order"}
      </Button>
    </form>
  );
}
