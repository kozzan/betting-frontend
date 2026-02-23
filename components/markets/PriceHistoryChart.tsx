"use client";

import { useState } from "react";
import useSWR from "swr";
import type { ApiResponse, PricePoint } from "@/types/markets";

type Range = "1H" | "1D" | "ALL";

const RANGES: Range[] = ["1H", "1D", "ALL"];

const VIEW_W = 400;
const VIEW_H = 120;
const PAD_LEFT = 32;
const PAD_RIGHT = 36;
const PAD_TOP = 8;
const PAD_BOTTOM = 20;

const CHART_W = VIEW_W - PAD_LEFT - PAD_RIGHT;
const CHART_H = VIEW_H - PAD_TOP - PAD_BOTTOM;

const GRIDLINES = [25, 50, 75];
const GREEN = "#10b981";

interface PriceHistoryChartProps {
  readonly marketId: string;
}

async function fetcher(url: string): Promise<PricePoint[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load price history");
  const json: ApiResponse<PricePoint[]> = await res.json();
  return json.data;
}

function pctToY(pct: number): number {
  // 100% => top (PAD_TOP), 0% => bottom (PAD_TOP + CHART_H)
  return PAD_TOP + CHART_H - (pct / 100) * CHART_H;
}

function buildPath(points: PricePoint[]): string {
  if (points.length === 0) return "";
  const n = points.length;
  return points
    .map((pt, i) => {
      const x = PAD_LEFT + (i / (n === 1 ? 1 : n - 1)) * CHART_W;
      const y = pctToY(pt.yesPct);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(points: PricePoint[]): string {
  if (points.length < 2) return "";
  const n = points.length;
  const bottom = PAD_TOP + CHART_H;
  const lineParts = points.map((pt, i) => {
    const x = PAD_LEFT + (i / (n - 1)) * CHART_W;
    const y = pctToY(pt.yesPct);
    return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const lastX = PAD_LEFT + CHART_W;
  const firstX = PAD_LEFT;
  return `${lineParts.join(" ")} L${lastX.toFixed(2)},${bottom} L${firstX.toFixed(2)},${bottom} Z`;
}

interface ChartContentProps {
  isLoading: boolean;
  error: Error | undefined;
  data: PricePoint[] | undefined;
  marketId: string;
}

function ChartContent({ isLoading, error, data, marketId }: ChartContentProps) {
  if (isLoading) {
    return (
      <div className="h-[120px] flex items-center justify-center" role="status" aria-label="Loading price history">
        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-[120px] flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Failed to load chart</p>
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="h-[120px] flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No trades yet</p>
      </div>
    );
  }

  const last = data.at(-1)!;
  const x = PAD_LEFT + CHART_W + 3;
  const y = pctToY(last.yesPct);

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-[120px]"
      aria-label="YES probability history chart"
    >
      <defs>
        <linearGradient id={`area-grad-${marketId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GREEN} stopOpacity="0.15" />
          <stop offset="100%" stopColor={GREEN} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {GRIDLINES.map((pct) => {
        const gy = pctToY(pct);
        return (
          <g key={pct}>
            <line
              x1={PAD_LEFT}
              y1={gy}
              x2={PAD_LEFT + CHART_W}
              y2={gy}
              stroke="currentColor"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
            <text
              x={PAD_LEFT - 4}
              y={gy}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="8"
              fill="currentColor"
              opacity="0.4"
            >
              {pct}
            </text>
          </g>
        );
      })}

      {/* Bottom axis line */}
      <line
        x1={PAD_LEFT}
        y1={PAD_TOP + CHART_H}
        x2={PAD_LEFT + CHART_W}
        y2={PAD_TOP + CHART_H}
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1"
      />

      {/* Area fill */}
      <path
        d={buildAreaPath(data)}
        fill={`url(#area-grad-${marketId})`}
      />

      {/* Line */}
      <path
        d={buildPath(data)}
        fill="none"
        stroke={GREEN}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* End label */}
      <text
        x={x}
        y={y}
        dominantBaseline="middle"
        fontSize="8"
        fontWeight="600"
        fill={GREEN}
      >
        {Math.round(last.yesPct)}%
      </text>
    </svg>
  );
}

export function PriceHistoryChart({ marketId }: PriceHistoryChartProps) {
  const [range, setRange] = useState<Range>("1D");

  const { data, error, isLoading } = useSWR<PricePoint[]>(
    `/api/markets/${marketId}/price-history?range=${range}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  return (
    <div className="space-y-3">
      {/* Range toggle */}
      <div className="flex items-center gap-1">
        {RANGES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={range === r}
            onClick={() => setRange(r)}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
              range === r
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Chart area */}
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <ChartContent
          isLoading={isLoading}
          error={error}
          data={data}
          marketId={marketId}
        />
      </div>
    </div>
  );
}
