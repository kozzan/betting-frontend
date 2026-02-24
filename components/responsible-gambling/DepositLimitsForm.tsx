"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage } from "@/lib/format";
import type { ResponsibleGamblingSettings } from "@/types/responsible-gambling";

interface DepositLimitsFormProps {
  readonly settings: ResponsibleGamblingSettings;
  readonly onUpdate: () => void;
}

function centsToDisplay(cents: number | null): string {
  if (cents === null) return "";
  return String(cents / 100);
}

function displayToCents(value: string): number | null {
  const num = Number.parseFloat(value);
  if (Number.isNaN(num) || num < 0) return null;
  return Math.round(num * 100);
}

export function DepositLimitsForm({ settings, onUpdate }: DepositLimitsFormProps) {
  const [daily, setDaily] = useState(centsToDisplay(settings.dailyDepositLimitCents));
  const [weekly, setWeekly] = useState(centsToDisplay(settings.weeklyDepositLimitCents));
  const [monthly, setMonthly] = useState(centsToDisplay(settings.monthlyDepositLimitCents));
  const [saving, setSaving] = useState(false);

  function isIncrease(): boolean {
    const newDaily = displayToCents(daily);
    const newWeekly = displayToCents(weekly);
    const newMonthly = displayToCents(monthly);

    if (newDaily !== null && settings.dailyDepositLimitCents !== null && newDaily > settings.dailyDepositLimitCents) return true;
    if (newWeekly !== null && settings.weeklyDepositLimitCents !== null && newWeekly > settings.weeklyDepositLimitCents) return true;
    if (newMonthly !== null && settings.monthlyDepositLimitCents !== null && newMonthly > settings.monthlyDepositLimitCents) return true;
    // If previously null (no limit) and now setting a limit — that's a new limit, not an increase
    return false;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/me/responsible-gambling/deposit-limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyDepositLimitCents: displayToCents(daily),
          weeklyDepositLimitCents: displayToCents(weekly),
          monthlyDepositLimitCents: displayToCents(monthly),
        }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      if (isIncrease()) {
        toast.success("Deposit limits updated. Increases take 24 hours to apply for your protection.");
      } else {
        toast.success("Deposit limits updated");
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
          <Label htmlFor="daily-deposit" className="text-xs text-muted-foreground uppercase tracking-wide">
            Daily limit (SEK)
          </Label>
          <Input
            id="daily-deposit"
            type="number"
            min="0"
            step="1"
            placeholder="No limit"
            value={daily}
            onChange={(e) => setDaily(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="weekly-deposit" className="text-xs text-muted-foreground uppercase tracking-wide">
            Weekly limit (SEK)
          </Label>
          <Input
            id="weekly-deposit"
            type="number"
            min="0"
            step="1"
            placeholder="No limit"
            value={weekly}
            onChange={(e) => setWeekly(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monthly-deposit" className="text-xs text-muted-foreground uppercase tracking-wide">
            Monthly limit (SEK)
          </Label>
          <Input
            id="monthly-deposit"
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
        {saving ? "Saving…" : "Save deposit limits"}
      </Button>
    </form>
  );
}
