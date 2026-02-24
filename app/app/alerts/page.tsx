import { apiRequest } from "@/lib/api";
import type { ApiResponse } from "@/types/markets";
import type { PriceAlert } from "@/types/alert";
import { AlertsPageClient } from "@/components/alerts/AlertsPageClient";

export default async function AlertsPage() {
  let alerts: PriceAlert[];
  try {
    const res = await apiRequest<ApiResponse<PriceAlert[]>>("/api/v1/alerts");
    alerts = res.data;
  } catch {
    alerts = [];
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">My Price Alerts</h1>
      <AlertsPageClient alerts={alerts} />
    </div>
  );
}
