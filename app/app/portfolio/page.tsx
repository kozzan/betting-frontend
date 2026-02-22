import { apiRequest } from "@/lib/api";
import type { ApiResponse, PagedResponse } from "@/types/markets";
import type { Position } from "@/types/positions";
import { PositionsTable } from "@/components/portfolio/PositionsTable";

function formatCents(cents: number, signed = false): string {
  const dollars = cents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(dollars));
  if (!signed) return formatted;
  if (cents > 0) return `+${formatted}`;
  if (cents < 0) return `-${formatted}`;
  return formatted;
}

export default async function PortfolioPage() {
  let positions: Position[];
  try {
    const res = await apiRequest<ApiResponse<PagedResponse<Position>>>(
      "/api/v1/positions?size=100&sort=createdAt,desc"
    );
    positions = res.data.content;
  } catch {
    positions = [];
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Portfolio</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-md border border-border p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            Realised P&L
          </p>
          <p
            className={`text-2xl font-semibold tabular-nums ${
              totalRealisedPnl > 0
                ? "text-emerald-600"
                : totalRealisedPnl < 0
                  ? "text-red-600"
                  : ""
            }`}
          >
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

      {/* Positions table */}
      <PositionsTable positions={positions} />
    </div>
  );
}
