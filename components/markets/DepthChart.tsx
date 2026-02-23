"use client";

import type { PriceLevel } from "@/types/markets";

interface DepthChartProps {
  readonly bids: PriceLevel[];
  readonly asks: PriceLevel[];
}

interface CumulativePoint {
  priceCents: number;
  cumQty: number;
}

function buildCumulativeSeries(
  levels: PriceLevel[],
  direction: "desc" | "asc"
): CumulativePoint[] {
  const sorted = [...levels].sort((a, b) =>
    direction === "desc"
      ? b.priceCents - a.priceCents
      : a.priceCents - b.priceCents
  );
  let running = 0;
  return sorted.map((lvl) => {
    running += lvl.totalQuantity;
    return { priceCents: lvl.priceCents, cumQty: running };
  });
}

const SVG_W = 600;
const SVG_H = 120;
const PAD_LEFT = 4;
const PAD_RIGHT = 4;
const PAD_TOP = 8;
const PAD_BOTTOM = 20;

const CHART_W = SVG_W - PAD_LEFT - PAD_RIGHT;
const CHART_H = SVG_H - PAD_TOP - PAD_BOTTOM;

function priceToX(priceCents: number): number {
  return PAD_LEFT + (priceCents / 100) * CHART_W;
}

function qtyToY(qty: number, maxQty: number): number {
  if (maxQty === 0) return PAD_TOP + CHART_H;
  return PAD_TOP + CHART_H - (qty / maxQty) * CHART_H;
}

function buildAreaPath(
  points: CumulativePoint[],
  maxQty: number
): string {
  if (points.length === 0) return "";

  // Step-line: each price level is a vertical drop then horizontal run.
  const baseY = PAD_TOP + CHART_H;
  const startX = priceToX(points[0].priceCents);

  const segments: string[] = [`M ${startX} ${baseY}`];
  for (const pt of points) {
    const x = priceToX(pt.priceCents);
    const y = qtyToY(pt.cumQty, maxQty);
    segments.push(`L ${x} ${y}`, `L ${x} ${y}`);
  }

  // Close down to baseline at the last point
  const endX = priceToX(points.at(-1)!.priceCents);
  segments.push(`L ${endX} ${baseY}`, "Z");

  return segments.join(" ");
}

function buildStepLinePath(
  points: CumulativePoint[],
  maxQty: number
): string {
  if (points.length === 0) return "";
  const parts: string[] = [];
  for (let i = 0; i < points.length; i++) {
    const x = priceToX(points[i].priceCents);
    const y = qtyToY(points[i].cumQty, maxQty);
    if (i === 0) {
      parts.push(`M ${x} ${y}`);
    } else {
      // Step: horizontal to new price, then vertical to new cumulative qty
      parts.push(`H ${x}`, `V ${y}`);
    }
  }
  return parts.join(" ");
}

// X-axis tick labels
const TICK_PRICES = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

export function DepthChart({ bids, asks }: DepthChartProps) {
  const isEmpty = bids.length === 0 && asks.length === 0;
  if (isEmpty) return null;

  const bidSeries = buildCumulativeSeries(bids, "desc");
  const askSeries = buildCumulativeSeries(asks, "asc");

  const maxQty = Math.max(
    bidSeries.length > 0 ? bidSeries.at(-1)!.cumQty : 0,
    askSeries.length > 0 ? askSeries.at(-1)!.cumQty : 0
  );

  const bidAreaPath = buildAreaPath(bidSeries, maxQty);
  const askAreaPath = buildAreaPath(askSeries, maxQty);
  const bidLinePath = buildStepLinePath(bidSeries, maxQty);
  const askLinePath = buildStepLinePath(askSeries, maxQty);

  const baselineY = PAD_TOP + CHART_H;

  return (
    <div className="border-t border-border px-3 py-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
        Depth Chart
      </p>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full"
        aria-label="Market depth chart"
      >
        {/* Baseline */}
        <line
          x1={PAD_LEFT}
          y1={baselineY}
          x2={SVG_W - PAD_RIGHT}
          y2={baselineY}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeWidth={1}
        />

        {/* Bid area (green) */}
        {bidAreaPath && (
          <path d={bidAreaPath} fill="#10b981" fillOpacity={0.2} />
        )}

        {/* Ask area (red) */}
        {askAreaPath && (
          <path d={askAreaPath} fill="#ef4444" fillOpacity={0.2} />
        )}

        {/* Bid step line */}
        {bidLinePath && (
          <path
            d={bidLinePath}
            fill="none"
            stroke="#10b981"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}

        {/* Ask step line */}
        {askLinePath && (
          <path
            d={askLinePath}
            fill="none"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}

        {/* X-axis tick labels */}
        {TICK_PRICES.map((p) => (
          <text
            key={p}
            x={priceToX(p)}
            y={SVG_H - 4}
            textAnchor="middle"
            fontSize={9}
            fill="currentColor"
            fillOpacity={0.45}
            fontFamily="monospace"
          >
            {p}
          </text>
        ))}
      </svg>
    </div>
  );
}
