"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage, formatDate } from "@/lib/format";
import type { ResponsibleGamblingSettings } from "@/types/responsible-gambling";

const DURATION_OPTIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "180", label: "180 days" },
];

interface CoolingOffSectionProps {
  readonly settings: ResponsibleGamblingSettings;
  readonly onUpdate: () => void;
}

export function CoolingOffSection({ settings, onUpdate }: CoolingOffSectionProps) {
  const [duration, setDuration] = useState("30");
  const [activating, setActivating] = useState(false);

  async function handleActivate() {
    setActivating(true);
    try {
      const res = await fetch("/api/me/responsible-gambling/cooling-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ durationDays: Number.parseInt(duration, 10) }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      toast.success("Cooling-off period activated");
      onUpdate();
    } finally {
      setActivating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Status:</span>
        {settings.isInCoolingOff && settings.coolingOffUntil ? (
          <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
            Active until {formatDate(settings.coolingOffUntil)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Not active</span>
        )}
      </div>

      {!settings.isInCoolingOff && (
        <div className="flex items-end gap-3">
          <div className="space-y-1.5">
            <label htmlFor="cooling-off-duration" className="text-xs text-muted-foreground uppercase tracking-wide block">
              Duration
            </label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="cooling-off-duration" className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={activating}>
                Activate cooling-off
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Activate Cooling-Off Period?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <span className="block">
                    You are about to activate a cooling-off period of{" "}
                    <strong>{DURATION_OPTIONS.find((o) => o.value === duration)?.label}</strong>.
                  </span>
                  <span className="block font-medium text-destructive">
                    Once activated, you won&apos;t be able to trade for the selected period.
                    This cannot be cancelled early.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleActivate}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {activating ? "Activating…" : "Yes, activate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}
