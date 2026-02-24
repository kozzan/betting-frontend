"use client";

import { useState } from "react";
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
import type { Order } from "@/types/orders";

interface MMOrdersTableProps {
  readonly orders: Order[];
  readonly onCancelOrder: (orderId: string) => Promise<boolean>;
  readonly onCancelAll: () => Promise<boolean>;
}

function formatCents(cents: number): string {
  return `${cents}¢`;
}

function CancelOrderButton({
  orderId,
  onCancel,
}: {
  readonly orderId: string;
  readonly onCancel: (id: string) => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onCancel(orderId);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          className="text-xs text-destructive hover:underline disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Cancelling…" : "Cancel"}
        </button>
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

function CancelAllButton({
  count,
  onCancelAll,
}: {
  readonly count: number;
  readonly onCancelAll: () => Promise<boolean>;
}) {
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await onCancelAll();
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={loading || count === 0}>
          {loading ? "Cancelling…" : `Cancel All (${count})`}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel all orders?</AlertDialogTitle>
          <AlertDialogDescription>
            All {count} active orders for this market will be cancelled and held
            funds released.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep orders</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Cancel all orders
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function MMOrdersTable({
  orders,
  onCancelOrder,
  onCancelAll,
}: MMOrdersTableProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Active Orders ({orders.length})
        </h2>
        <CancelAllButton count={orders.length} onCancelAll={onCancelAll} />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-md border border-border px-4 py-8 text-center text-sm text-muted-foreground">
          No active orders on this market.
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Side</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium tabular-nums">
                  Price
                </th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Orig Qty
                </th>
                <th className="text-left px-4 py-3 font-medium">Rem Qty</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Held
                </th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold ${
                        order.side === "YES"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {order.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {order.action}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-mono text-xs">
                    {formatCents(order.priceCents)}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-xs text-muted-foreground hidden sm:table-cell">
                    {order.quantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-xs font-medium">
                    {order.remainingQuantity.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-xs text-muted-foreground hidden md:table-cell">
                    {formatCents(order.heldAmountCents)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <Badge
                      variant={
                        order.status === "OPEN" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {order.status === "PARTIALLY_FILLED"
                        ? "PARTIAL"
                        : order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CancelOrderButton
                      orderId={order.id}
                      onCancel={onCancelOrder}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
