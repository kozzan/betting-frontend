"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { QuoteRequest, BulkQuoteResult } from "@/types/marketmaker";

interface QuoteRow extends QuoteRequest {
  _id: number;
}

interface RowResult {
  success: boolean;
  orderId?: string;
  errorMessage?: string;
}

interface BulkQuoteFormProps {
  readonly marketId: string;
  readonly onSuccess: () => void;
}

let nextId = 1;

function createRow(): QuoteRow {
  return { _id: nextId++, side: "YES", action: "BUY", priceCents: 50, quantity: 100 };
}

export function BulkQuoteForm({ marketId, onSuccess }: BulkQuoteFormProps) {
  const [rows, setRows] = useState<QuoteRow[]>([createRow()]);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<RowResult[] | null>(null);

  function addRow() {
    if (rows.length >= 10) {
      toast.error("Maximum 10 quotes per submission");
      return;
    }
    setRows((prev) => [...prev, createRow()]);
    setResults(null);
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r._id !== id));
    setResults(null);
  }

  function updateRow(id: number, field: keyof QuoteRequest, value: string | number) {
    setRows((prev) =>
      prev.map((r) => (r._id === id ? { ...r, [field]: value } : r))
    );
    setResults(null);
  }

  function validate(): string | null {
    for (const row of rows) {
      if (!row.side || !row.action) return "Side and action are required for all rows.";
      const p = Number(row.priceCents);
      if (!Number.isInteger(p) || p < 1 || p > 99) {
        return `Price must be between 1 and 99 cents (got ${p}).`;
      }
      const q = Number(row.quantity);
      if (!Number.isInteger(q) || q < 1) {
        return `Quantity must be a positive integer (got ${q}).`;
      }
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setSubmitting(true);
    setResults(null);

    try {
      const quotes: QuoteRequest[] = rows.map(({ side, action, priceCents, quantity }) => ({
        side,
        action,
        priceCents: Number(priceCents),
        quantity: Number(quantity),
      }));

      const res = await fetch("/api/mm/bulk-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketId, quotes }),
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

      const data: BulkQuoteResult = await res.json();
      const rowResults: RowResult[] = data.results.map((r) => ({
        success: r.success,
        orderId: r.orderId,
        errorMessage: r.errorMessage,
      }));
      setResults(rowResults);

      const successCount = rowResults.filter((r) => r.success).length;
      const failCount = rowResults.length - successCount;

      if (successCount > 0 && failCount === 0) {
        toast.success(`${successCount} quote${successCount > 1 ? "s" : ""} submitted successfully`);
        setRows([createRow()]);
        setResults(null);
        onSuccess();
      } else if (successCount > 0) {
        toast.warning(`${successCount} succeeded, ${failCount} failed`);
        onSuccess();
      } else {
        toast.error("All quotes failed — check errors below");
      }
    } catch {
      toast.error("Failed to submit quotes");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        {/* Header row */}
        <div className="grid grid-cols-[80px_80px_90px_90px_32px] gap-2 px-1">
          <Label className="text-xs text-muted-foreground">Side</Label>
          <Label className="text-xs text-muted-foreground">Action</Label>
          <Label className="text-xs text-muted-foreground">Price (¢)</Label>
          <Label className="text-xs text-muted-foreground">Quantity</Label>
          <span />
        </div>

        {rows.map((row, idx) => {
          const result = results?.[idx];
          return (
            <div key={row._id} className="space-y-1">
              <div className="grid grid-cols-[80px_80px_90px_90px_32px] gap-2 items-center">
                {/* Side */}
                <select
                  value={row.side}
                  onChange={(e) => updateRow(row._id, "side", e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  disabled={submitting}
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>

                {/* Action */}
                <select
                  value={row.action}
                  onChange={(e) => updateRow(row._id, "action", e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  disabled={submitting}
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>

                {/* Price */}
                <Input
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  value={row.priceCents}
                  onChange={(e) => updateRow(row._id, "priceCents", e.target.value)}
                  className="h-9 text-sm tabular-nums"
                  disabled={submitting}
                  required
                />

                {/* Quantity */}
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={row.quantity}
                  onChange={(e) => updateRow(row._id, "quantity", e.target.value)}
                  className="h-9 text-sm tabular-nums"
                  disabled={submitting}
                  required
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeRow(row._id)}
                  disabled={rows.length === 1 || submitting}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-30 text-lg leading-none"
                  title="Remove row"
                >
                  &times;
                </button>
              </div>

              {/* Per-row result */}
              {result && (
                <p
                  className={`text-xs px-1 ${
                    result.success
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  }`}
                >
                  {result.success
                    ? `Submitted — order ${result.orderId?.slice(0, 8) ?? ""}…`
                    : `Failed: ${result.errorMessage ?? "unknown error"}`}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addRow}
          disabled={rows.length >= 10 || submitting}
        >
          + Add Row
        </Button>
        <Button type="submit" size="sm" disabled={submitting}>
          {submitting ? "Submitting…" : `Submit ${rows.length} Quote${rows.length > 1 ? "s" : ""}`}
        </Button>
        <span className="text-xs text-muted-foreground">
          {rows.length}/10 rows
        </span>
      </div>
    </form>
  );
}
