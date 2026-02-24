"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderAction } from "@/types/orders";

interface ConditionalOrderToggleProps {
  readonly isConditional: boolean;
  readonly triggerPriceCents: number | null;
  readonly orderAction: OrderAction;
  readonly onConditionalChange: (isConditional: boolean) => void;
  readonly onTriggerPriceChange: (price: number | null) => void;
}

export function ConditionalOrderToggle({
  isConditional,
  triggerPriceCents,
  orderAction,
  onConditionalChange,
  onTriggerPriceChange,
}: ConditionalOrderToggleProps) {
  const triggerLabel =
    orderAction === "BUY"
      ? "Trigger when price falls to or below"
      : "Trigger when price rises to or above";

  function handleTriggerInput(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === "") {
      onTriggerPriceChange(null);
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      onTriggerPriceChange(parsed);
    }
  }

  const triggerInputValue =
    triggerPriceCents === null ? "" : String(triggerPriceCents);

  return (
    <div className="space-y-3">
      {/* Toggle row */}
      <div className="flex items-center justify-between">
        <Label
          htmlFor="conditional-toggle"
          className="text-xs text-muted-foreground uppercase tracking-wide cursor-pointer"
        >
          Conditional Order
        </Label>
        <button
          id="conditional-toggle"
          type="button"
          role="switch"
          aria-checked={isConditional}
          onClick={() => onConditionalChange(!isConditional)}
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
            isConditional ? "bg-primary" : "bg-input"
          }`}
        >
          <span
            className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
              isConditional ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Expanded section */}
      {isConditional && (
        <div className="rounded-md border border-border bg-muted/20 p-3 space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="trigger-price"
              className="text-xs text-muted-foreground uppercase tracking-wide"
            >
              Trigger Price (¢)
            </Label>
            <p className="text-xs text-muted-foreground">{triggerLabel}</p>
            <div className="relative">
              <Input
                id="trigger-price"
                type="number"
                min={1}
                max={99}
                step={1}
                placeholder="e.g. 40"
                value={triggerInputValue}
                onChange={handleTriggerInput}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                ¢
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This order will only enter the order book when the price reaches
            your trigger.
          </p>
        </div>
      )}
    </div>
  );
}
