"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SetAlertModal } from "@/components/markets/SetAlertModal";
import { useAlerts } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";

interface AlertButtonProps {
  readonly marketId: string;
  readonly marketTitle: string;
  readonly currentPriceCents?: number;
  readonly className?: string;
}

export function AlertButton({
  marketId,
  marketTitle,
  currentPriceCents,
  className,
}: AlertButtonProps) {
  const [open, setOpen] = useState(false);
  const { alerts } = useAlerts();

  const hasActiveAlert = alerts.some(
    (a) => a.marketId === marketId && a.status === "ACTIVE"
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn("relative gap-1.5", className)}
        title="Set price alert"
      >
        <Bell
          className={cn(
            "h-4 w-4",
            hasActiveAlert && "fill-amber-400 text-amber-500"
          )}
        />
        Set Alert
        {hasActiveAlert && (
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400" />
        )}
      </Button>

      {open && (
        <SetAlertModal
          marketId={marketId}
          marketTitle={marketTitle}
          currentPriceCents={currentPriceCents}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
