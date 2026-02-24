import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { decodeJwtPayload } from "@/lib/auth";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, PagedResponse } from "@/types/markets";
import type { Order } from "@/types/orders";
import { MMPortalClient } from "./MMPortalClient";

export const metadata = { title: "Market Maker Portal" };

export default async function MMPortalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;

  if (decoded?.role !== "MARKET_MAKER") {
    notFound();
  }

  // Fetch open orders to derive active markets
  let openOrders: Order[] = [];
  try {
    const res = await apiRequest<ApiResponse<PagedResponse<Order>>>(
      "/api/v1/orders?status=OPEN&size=200&sort=createdAt,desc"
    );
    openOrders = res.data.content;
  } catch {
    openOrders = [];
  }

  return <MMPortalClient initialOrders={openOrders} />;
}
