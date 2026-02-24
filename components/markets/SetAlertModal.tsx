"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlerts } from "@/hooks/useAlerts";
import type { AlertDirection } from "@/types/alert";

interface SetAlertModalProps {
  readonly marketId: string;
  readonly marketTitle: string;
  readonly currentPriceCents?: number;
  readonly onClose: () => void;
}

export function SetAlertModal({
  marketId,
  marketTitle,
  currentPriceCents,
  onClose,
}: SetAlertModalProps) {
  const { createAlert } = useAlerts();
  const [direction, setDirection] = useState<AlertDirection>("ABOVE");
  const [threshold, setThreshold] = useState(
    currentPriceCents === undefined ? "" : String(currentPriceCents)
  );
  const [submitting, setSubmitting] = useState(false);

  const thresholdCents = Number.parseInt(threshold, 10);
  const validThreshold =
    !Number.isNaN(thresholdCents) &&
    thresholdCents >= 1 &&
    thresholdCents <= 99;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validThreshold) return;
    setSubmitting(true);
    try {
      await createAlert({ marketId, thresholdCents, direction });
      toast.success("Price alert set");
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to set alert"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    /* Backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Set Price Alert"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm mx-4 rounded-lg border border-border bg-background shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Set Price Alert</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Market title */}
          <p className="text-sm text-muted-foreground leading-snug line-clamp-2">
            {marketTitle}
          </p>

          {/* Current price reference */}
          {currentPriceCents !== undefined && (
            <p className="text-xs text-muted-foreground">
              Current price:{" "}
              <span className="font-medium tabular-nums text-foreground">
                {currentPriceCents}¢
              </span>
            </p>
          )}

          {/* Direction */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Direction
            </Label>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-muted">
              {(["ABOVE", "BELOW"] as AlertDirection[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDirection(d)}
                  className={`py-1.5 rounded text-sm font-medium transition-colors ${
                    direction === d
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {d === "ABOVE" ? "Price rises ABOVE" : "Price falls BELOW"}
                </button>
              ))}
            </div>
          </div>

          {/* Threshold */}
          <div className="space-y-1.5">
            <Label
              htmlFor="alert-threshold"
              className="text-xs text-muted-foreground uppercase tracking-wide"
            >
              Threshold Price (¢)
            </Label>
            <div className="relative">
              <Input
                id="alert-threshold"
                type="number"
                min={1}
                max={99}
                step={1}
                placeholder="e.g. 75"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ¢
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={submitting || !validThreshold}
            >
              {submitting ? "Setting…" : "Set Alert"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
