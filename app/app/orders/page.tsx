import { apiRequest } from "@/lib/api";
import type { ApiResponse, Order } from "@/types/orders";
import type { PagedResponse } from "@/types/markets";
import { OrdersPageClient } from "@/components/orders/OrdersPageClient";

export default async function OrdersPage() {
  let orders: Order[];
  try {
    const res = await apiRequest<ApiResponse<PagedResponse<Order>>>(
      "/api/v1/orders?size=50&sort=createdAt,desc"
    );
    orders = res.data.content;
  } catch {
    orders = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>
      <OrdersPageClient orders={orders} />
    </div>
  );
}
