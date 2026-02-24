"use client";

import { useCallback } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import useSWR from "swr";
import { DepositLimitsForm } from "@/components/responsible-gambling/DepositLimitsForm";
import { LossLimitsForm } from "@/components/responsible-gambling/LossLimitsForm";
import { CoolingOffSection } from "@/components/responsible-gambling/CoolingOffSection";
import { RealityCheckSection } from "@/components/responsible-gambling/RealityCheckSection";
import type { ResponsibleGamblingSettings } from "@/types/responsible-gambling";
import type { ApiResponse } from "@/types/markets";

async function fetcher(url: string): Promise<ResponsibleGamblingSettings> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const json: ApiResponse<ResponsibleGamblingSettings> = await res.json();
  return json.data;
}

export default function ResponsibleGamblingPage() {
  const { data: settings, isLoading, mutate } = useSWR<ResponsibleGamblingSettings>(
    "/api/me/responsible-gambling",
    fetcher
  );

  const onUpdate = useCallback(() => {
    mutate();
  }, [mutate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Responsible Gambling</h1>
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Responsible Gambling</h1>
        <p className="text-sm text-muted-foreground">Failed to load settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">Responsible Gambling</h1>

      {/* Deposit Limits */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-medium">Deposit Limits</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set maximum amounts you can deposit per period.
          </p>
        </div>
        <div className="p-4">
          <DepositLimitsForm settings={settings} onUpdate={onUpdate} />
        </div>
      </div>

      {/* Loss Limits */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-medium">Loss Limits</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set maximum amounts you can lose per period.
          </p>
        </div>
        <div className="p-4">
          <LossLimitsForm settings={settings} onUpdate={onUpdate} />
        </div>
      </div>

      {/* Cooling Off */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-medium">Cooling-Off Period</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Temporarily suspend your ability to trade.
          </p>
        </div>
        <div className="p-4">
          <CoolingOffSection settings={settings} onUpdate={onUpdate} />
        </div>
      </div>

      {/* Reality Check */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-medium">Reality Check</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Receive periodic reminders of how long you have been active.
          </p>
        </div>
        <div className="p-4">
          <RealityCheckSection settings={settings} onUpdate={onUpdate} />
        </div>
      </div>

      {/* Self-Exclusion */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h2 className="text-sm font-medium">Self-Exclusion</h2>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Spelpaus is Sweden&apos;s national self-exclusion register. Registering with Spelpaus
            will block you from all licensed Swedish gambling operators.
          </p>
          <Link
            href="https://www.spelpaus.se"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Visit Spelpaus.se
            <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
