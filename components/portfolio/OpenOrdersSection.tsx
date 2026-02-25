"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import type { Order, OrderStatus } from "@/types/orders";
import { formatCents } from "@/lib/format";

interface OpenOrdersSectionProps {
  readonly initialOrders: Order[];
}

const STATUS_VARIANTS: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  OPEN: "default",
  PARTIALLY_FILLED: "secondary",
  FILLED: "outline",
  CANCELLED: "destructive",
  PENDING_TRIGGER: "secondary",
};

function CancelButton({
  orderId,
  onCancelled,
}: {
  readonly orderId: string;
  readonly onCancelled: (id: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const err: { message?: string; error?: string } = await res.json();
          message = err?.message ?? err?.error ?? message;
        } catch {
          // ignore parse error
        }
        toast.error(message);
        return;
      }
      toast.success("Order cancelled");
      onCancelled(orderId);
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          {loading ? "Cancelling…" : "Cancel"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
          <AlertDialogDescription>
            The order will be cancelled and any held funds will be released back
            to your available balance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep order</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function OpenOrdersSection({ initialOrders }: OpenOrdersSectionProps) {
  const [orders, setOrders] = useState(initialOrders);

  function handleCancelled(id: string) {
    setOrders((prev) =>
      prev.filter((o) => o.id !== id)
    );
  }

  if (orders.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground text-sm">
        No open orders.
      </p>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 font-medium">Market</th>
            <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
              Side / Action
            </th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
              Price
            </th>
            <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
              Qty (filled/total)
            </th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">
              Held
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {orders.map((order) => {
            const isPendingTrigger = order.status === "PENDING_TRIGGER";
            let statusLabel: string = order.status;
            if (order.status === "PARTIALLY_FILLED") statusLabel = "PARTIAL";
            else if (isPendingTrigger) statusLabel = "PENDING TRIGGER";

            return (
              <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/app/markets/${order.marketId}`}
                    className="text-xs font-mono text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {order.marketId.slice(0, 8)}…
                  </Link>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span
                    className={`text-xs font-medium ${
                      order.side === "YES" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {order.action} {order.side}
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell tabular-nums text-muted-foreground">
                  <span>{order.priceCents}¢</span>
                  {isPendingTrigger && order.triggerPriceCents !== undefined && (
                    <span className="ml-1.5 text-xs text-amber-600 dark:text-amber-400">
                      (trigger: {order.triggerPriceCents}¢)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell tabular-nums text-muted-foreground">
                  {order.filledQuantity}/{order.quantity}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANTS[order.status]}>
                    {statusLabel}
                  </Badge>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell tabular-nums text-muted-foreground">
                  {formatCents(order.heldAmountCents)}
                </td>
                <td className="px-4 py-3 text-right">
                  <CancelButton orderId={order.id} onCancelled={handleCancelled} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
