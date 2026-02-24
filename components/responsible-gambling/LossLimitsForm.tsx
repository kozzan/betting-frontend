"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/format";
import type { ResponsibleGamblingSettings } from "@/types/responsible-gambling";

interface LossLimitsFormProps {
  readonly settings: ResponsibleGamblingSettings;
  readonly onUpdate: () => void;
}

function centsToDisplay(cents: number | null): string {
  if (cents === null) return "";
  return String(cents / 100);
}

function displayToCents(value: string): number | null {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

export function LossLimitsForm({ settings, onUpdate }: LossLimitsFormProps) {
  const [daily, setDaily] = useState(centsToDisplay(settings.dailyLossLimitCents));
  const [weekly, setWeekly] = useState(centsToDisplay(settings.weeklyLossLimitCents));
  const [monthly, setMonthly] = useState(centsToDisplay(settings.monthlyLossLimitCents));
  const [saving, setSaving] = useState(false);

  function isIncrease(): boolean {
    const newDaily = displayToCents(daily);
    const newWeekly = displayToCents(weekly);
    const newMonthly = displayToCents(monthly);

    if (newDaily !== null && settings.dailyLossLimitCents !== null && newDaily > settings.dailyLossLimitCents) return true;
    if (newWeekly !== null && settings.weeklyLossLimitCents !== null && newWeekly > settings.weeklyLossLimitCents) return true;
    if (newMonthly !== null && settings.monthlyLossLimitCents !== null && newMonthly > settings.monthlyLossLimitCents) return true;
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/me/responsible-gambling/loss-limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyLossLimitCents: displayToCents(daily),
          weeklyLossLimitCents: displayToCents(weekly),
          monthlyLossLimitCents: displayToCents(monthly),
        }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      if (isIncrease()) {
        toast.success("Loss limits updated. Increases take 24 hours to apply for your protection.");
      } else {
        toast.success("Loss limits updated");
      }
      onUpdate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="daily-loss" className="text-xs text-muted-foreground uppercase tracking-wide">
            Daily limit (SEK)
          </Label>
          <Input
            id="daily-loss"
            type="number"
            min="0"
            step="1"
            placeholder="No limit"
            value={daily}
            onChange={(e) => setDaily(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weekly-loss" className="text-xs text-muted-foreground uppercase tracking-wide">
            Weekly limit (SEK)
          </Label>
          <Input
            id="weekly-loss"
            type="number"
            min="0"
            step="1"
            placeholder="No limit"
            value={weekly}
            onChange={(e) => setWeekly(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monthly-loss" className="text-xs text-muted-foreground uppercase tracking-wide">
            Monthly limit (SEK)
          </Label>
          <Input
            id="monthly-loss"
            type="number"
            min="0"
            step="1"
            placeholder="No limit"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
          />
        </div>
      </div>
      {isIncrease() && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          Limit increases take 24 hours to apply for your protection.
        </p>
      )}
      <Button type="submit" disabled={saving} size="sm">
        {saving ? "Saving…" : "Save loss limits"}
      </Button>
    </form>
  );
}
