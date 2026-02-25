import { getOrders } from "@/lib/api";
import type { Order } from "@/types/orders";
import { OrdersPageClient } from "@/components/orders/OrdersPageClient";

export default async function OrdersPage() {
  let orders: Order[];
  let totalPages: number;
  let totalElements: number;

  try {
    const res = await getOrders({ page: 0, limit: 50, sort: "createdAt,desc" });
    orders = res.content;
    totalPages = res.totalPages;
    totalElements = res.totalElements;
  } catch {
    orders = [];
    totalPages = 0;
    totalElements = 0;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Order History</h1>
      <OrdersPageClient
        initialOrders={orders}
        initialTotalPages={totalPages}
        initialTotalElements={totalElements}
      />
    </div>
  );
}
