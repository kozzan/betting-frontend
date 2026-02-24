"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/format";
import type { ResponsibleGamblingSettings } from "@/types/responsible-gambling";

const INTERVAL_OPTIONS = [
  { value: "15", label: "Every 15 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every 60 minutes" },
  { value: "120", label: "Every 120 minutes" },
];

interface RealityCheckSectionProps {
  readonly settings: ResponsibleGamblingSettings;
  readonly onUpdate: () => void;
}

export function RealityCheckSection({ settings, onUpdate }: RealityCheckSectionProps) {
  const [enabled, setEnabled] = useState(settings.realityCheckIntervalMins !== null);
  const [interval, setInterval] = useState(
    String(settings.realityCheckIntervalMins ?? 30)
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const intervalMins = enabled ? parseInt(interval, 10) : null;
      const res = await fetch("/api/me/responsible-gambling/reality-check", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intervalMins }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      toast.success(enabled ? "Reality check enabled" : "Reality check disabled");
      onUpdate();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
        </label>
        <span className="text-sm">
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>

      {enabled && (
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wide block">
            Check interval
          </label>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-52">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVAL_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? "Saving…" : "Save reality check"}
      </Button>
    </div>
  );
}
