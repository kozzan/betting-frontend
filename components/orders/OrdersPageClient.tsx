"use client";

import { useState } from "react";
import { OrdersTable } from "@/components/orders/OrdersTable";
import type { Order, OrderStatus } from "@/types/orders";

interface OrdersPageClientProps {
  readonly orders: Order[];
}

const FILTER_TABS: { label: string; value: "ALL" | OrderStatus }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "OPEN" },
  { label: "Partial", value: "PARTIALLY_FILLED" },
  { label: "Filled", value: "FILLED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function OrdersPageClient({ orders: initialOrders }: OrdersPageClientProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeFilter, setActiveFilter] = useState<"ALL" | OrderStatus>("ALL");

  function handleCancelled(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: "CANCELLED" as OrderStatus } : o
      )
    );
  }

  const filtered =
    activeFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.value === "ALL"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
                activeFilter === tab.value
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
              <span className="text-xs tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      <OrdersTable orders={filtered} onCancelled={handleCancelled} />
    </div>
  );
}
