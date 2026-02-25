import { apiRequest } from "@/lib/api";
import type { ApiResponse, PagedResponse } from "@/types/markets";
import type { Position } from "@/types/positions";
import { PositionsTable } from "@/components/portfolio/PositionsTable";
import { OpenOrdersSection } from "@/components/portfolio/OpenOrdersSection";
import { formatCents } from "@/lib/format";
import type { Order } from "@/types/orders";

export default async function PortfolioPage() {
  let positions: Position[];
  let openOrders: Order[];

  try {
    const res = await apiRequest<ApiResponse<PagedResponse<Position>>>(
      "/api/v1/positions?size=100&sort=createdAt,desc"
    );
    positions = res.data.content;
  } catch {
    positions = [];
  }

  try {
    const res = await apiRequest<ApiResponse<PagedResponse<Order>>>(
      "/api/v1/orders?status=OPEN&status=PARTIALLY_FILLED&status=PENDING_TRIGGER&size=100&sort=createdAt,desc"
    );
    openOrders = res.data.content;
  } catch {
    openOrders = [];
  }

  const openPositions = positions.filter((p) => p.quantity > 0);
  const totalRealisedPnl = positions.reduce(
    (sum, p) => sum + p.realisedPnlCents,
    0
  );
  const costBasis = openPositions.reduce(
    (sum, p) => sum + p.averagePriceCents * p.quantity,
    0
  );

  let pnlColor = "";
  if (totalRealisedPnl > 0) pnlColor = "text-emerald-600";
  else if (totalRealisedPnl < 0) pnlColor = "text-red-600";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Portfolio</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Realised P&L
          </p>
          <p className={`text-2xl font-semibold tabular-nums ${pnlColor}`}>
            {formatCents(totalRealisedPnl, true)}
          </p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Open Positions
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {openPositions.length}
          </p>
        </div>
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Cost Basis
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatCents(costBasis)}
          </p>
        </div>
      </div>

      {/* Positions table with sorting */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Positions</h2>
        <PositionsTable positions={positions} />
      </div>

      {/* Open orders section */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Open Orders</h2>
        <OpenOrdersSection initialOrders={openOrders} />
      </div>
    </div>
  );
}
