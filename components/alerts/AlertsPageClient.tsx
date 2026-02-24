"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAlerts } from "@/hooks/useAlerts";
import type { PriceAlert, AlertStatus } from "@/types/alert";

interface AlertsPageClientProps {
  readonly alerts: PriceAlert[];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

const STATUS_VARIANTS: Record<
  AlertStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  ACTIVE: "default",
  TRIGGERED: "outline",
  CANCELLED: "destructive",
};

function DeleteButton({
  alertId,
  onDeleted,
}: {
  readonly alertId: string;
  readonly onDeleted: (id: string) => void;
}) {
  const { deleteAlert } = useAlerts();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteAlert(alertId);
      toast.success("Alert deleted");
      onDeleted(alertId);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete alert"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-destructive hover:underline disabled:opacity-50"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}

export function AlertsPageClient({ alerts: initialAlerts }: AlertsPageClientProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>(initialAlerts);

  function handleDeleted(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  if (alerts.length === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <Bell className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground text-sm">
          No active alerts. Set an alert on any market.
        </p>
        <Link
          href="/app/markets"
          className="text-sm text-primary hover:underline"
        >
          Browse markets &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Market</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
              Condition
            </th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
              Created
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {alerts.map((alert) => (
            <tr
              key={alert.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/app/markets/${alert.marketId}`}
                  className="hover:underline"
                >
                  {alert.marketTitle ? (
                    <span className="text-sm font-medium line-clamp-2">
                      {alert.marketTitle}
                    </span>
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground">
                      {alert.marketId.slice(0, 8)}…
                    </span>
                  )}
                </Link>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell text-muted-foreground">
                Notify when price{" "}
                <span className="font-medium text-foreground">
                  {alert.direction === "ABOVE" ? "rises above" : "falls below"}
                </span>{" "}
                <span className="tabular-nums font-medium text-foreground">
                  {alert.thresholdCents}¢
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="space-y-0.5">
                  <Badge variant={STATUS_VARIANTS[alert.status]}>
                    {alert.status}
                  </Badge>
                  {alert.status === "TRIGGERED" && alert.triggeredAt && (
                    <p className="text-xs text-muted-foreground">
                      {formatDate(alert.triggeredAt)}
                    </p>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                {formatDate(alert.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                {alert.status !== "CANCELLED" && (
                  <DeleteButton
                    alertId={alert.id}
                    onDeleted={handleDeleted}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
