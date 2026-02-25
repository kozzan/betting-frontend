"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Order, OrderStatus, OrderAction } from "@/types/orders";
import type { ApiResponse, PagedResponse } from "@/types/markets";
import { formatCents, formatDate } from "@/lib/format";

const PAGE_SIZE = 50;

interface OrdersPageClientProps {
  readonly initialOrders: Order[];
  readonly initialTotalPages: number;
  readonly initialTotalElements: number;
}

const STATUS_VARIANTS: Record<
  OrderStatus,
  "default" | "secondary" | "outline" | "destructive"
> = {
  OPEN: "default",
  PARTIALLY_FILLED: "secondary",
  FILLED: "outline",
  CANCELLED: "destructive",
  PENDING_TRIGGER: "secondary",
};

function statusLabel(s: OrderStatus): string {
  if (s === "PARTIALLY_FILLED") return "PARTIAL";
  if (s === "PENDING_TRIGGER") return "PENDING";
  return s;
}

async function ordersFetcher(url: string): Promise<PagedResponse<Order>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Orders fetch failed: ${res.status}`);
  const json: ApiResponse<PagedResponse<Order>> = await res.json();
  return json.data;
}

function buildUrl(
  page: number,
  statusFilter: string,
  actionFilter: string,
  dateFrom: string,
  dateTo: string,
  sorting: SortingState
): string {
  const params = new URLSearchParams({
    page: String(page),
    size: String(PAGE_SIZE),
  });
  if (sorting.length > 0) {
    const { id, desc } = sorting[0];
    params.set("sort", `${id},${desc ? "desc" : "asc"}`);
  } else {
    params.set("sort", "createdAt,desc");
  }
  if (statusFilter && statusFilter !== "ALL") params.set("status", statusFilter);
  if (actionFilter && actionFilter !== "ALL") params.set("action", actionFilter);
  if (dateFrom) params.set("from", dateFrom);
  if (dateTo) params.set("to", dateTo);
  return `/api/orders?${params.toString()}`;
}

function exportToCsv(orders: Order[]) {
  const headers = [
    "Date",
    "Market",
    "Outcome",
    "Type",
    "Side",
    "Price",
    "Quantity",
    "Filled",
    "Status",
    "Fee",
  ];
  const rows = orders.map((o) => [
    formatDate(o.createdAt),
    o.marketTitle ?? o.marketId,
    o.side,
    o.type ?? "LIMIT",
    o.action,
    `${o.priceCents}¢`,
    String(o.quantity),
    String(o.filledQuantity),
    o.status,
    o.feeCents !== undefined ? formatCents(o.feeCents) : "—",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const columnHelper = createColumnHelper<Order>();

const columns: ColumnDef<Order, string | number | undefined>[] = [
  columnHelper.accessor("createdAt", {
    header: "Date",
    cell: (info) => (
      <span className="text-muted-foreground text-xs">
        {formatDate(info.getValue() as string)}
      </span>
    ),
  }),
  columnHelper.accessor((row) => row.marketTitle ?? row.marketId, {
    id: "market",
    header: "Market",
    enableSorting: false,
    cell: (info) => {
      const val = info.getValue() as string;
      return (
        <span className="text-xs font-mono text-muted-foreground">
          {val.length > 20 ? `${val.slice(0, 20)}…` : val}
        </span>
      );
    },
  }),
  columnHelper.accessor("side", {
    header: "Outcome",
    cell: (info) => {
      const side = info.getValue() as string;
      return (
        <Badge variant={side === "YES" ? "default" : "destructive"} className="text-xs">
          {side}
        </Badge>
      );
    },
  }),
  columnHelper.accessor((row) => row.type ?? "LIMIT", {
    id: "type",
    header: "Type",
    enableSorting: false,
    cell: (info) => (
      <span className="text-xs text-muted-foreground">{info.getValue() as string}</span>
    ),
  }),
  columnHelper.accessor("action", {
    header: "Side",
    cell: (info) => {
      const action = info.getValue() as string;
      return (
        <span
          className={`text-xs font-medium ${
            action === "BUY" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {action}
        </span>
      );
    },
  }),
  columnHelper.accessor("priceCents", {
    header: "Price",
    cell: (info) => (
      <span className="tabular-nums text-xs">{info.getValue() as number}¢</span>
    ),
  }),
  columnHelper.accessor("quantity", {
    header: "Qty",
    cell: (info) => (
      <span className="tabular-nums text-xs">{info.getValue() as number}</span>
    ),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => {
      const s = info.getValue() as OrderStatus;
      return (
        <Badge variant={STATUS_VARIANTS[s]} className="text-xs">
          {statusLabel(s)}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("feeCents", {
    header: "Fee",
    enableSorting: false,
    cell: (info) => {
      const fee = info.getValue();
      return (
        <span className="tabular-nums text-xs text-muted-foreground">
          {fee !== undefined ? formatCents(fee as number) : "—"}
        </span>
      );
    },
  }),
];

export function OrdersPageClient({
  initialOrders,
  initialTotalPages,
  initialTotalElements,
}: OrdersPageClientProps) {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);

  const swrUrl = buildUrl(page, statusFilter, actionFilter, dateFrom, dateTo, sorting);

  const { data } = useSWR(swrUrl, ordersFetcher, {
    fallbackData:
      page === 0 && statusFilter === "ALL" && actionFilter === "ALL" && !dateFrom && !dateTo
        ? {
            content: initialOrders,
            totalPages: initialTotalPages,
            totalElements: initialTotalElements,
            page: 0,
            size: PAGE_SIZE,
          }
        : undefined,
    keepPreviousData: true,
  });

  const orders = data?.content ?? initialOrders;
  const totalPages = data?.totalPages ?? initialTotalPages;

  const table = useReactTable({
    data: orders,
    columns,
    state: { sorting },
    onSortingChange: useCallback(
      (updater: SortingState | ((prev: SortingState) => SortingState)) => {
        setSorting(updater);
        setPage(0);
      },
      []
    ),
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function resetFilters() {
    setStatusFilter("ALL");
    setActionFilter("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">All statuses</SelectItem>
            <SelectItem value="OPEN" className="text-xs">Open</SelectItem>
            <SelectItem value="PARTIALLY_FILLED" className="text-xs">Partially filled</SelectItem>
            <SelectItem value="FILLED" className="text-xs">Filled</SelectItem>
            <SelectItem value="CANCELLED" className="text-xs">Cancelled</SelectItem>
            <SelectItem value="PENDING_TRIGGER" className="text-xs">Pending trigger</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={actionFilter}
          onValueChange={(v: string) => {
            setActionFilter(v as OrderAction | "ALL");
            setPage(0);
          }}
        >
          <SelectTrigger className="h-8 w-28 text-xs">
            <SelectValue placeholder="All sides" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL" className="text-xs">All sides</SelectItem>
            <SelectItem value="BUY" className="text-xs">Buy</SelectItem>
            <SelectItem value="SELL" className="text-xs">Sell</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setPage(0);
          }}
          className="h-8 w-36 text-xs"
          aria-label="From date"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setPage(0);
          }}
          className="h-8 w-36 text-xs"
          aria-label="To date"
        />

        <Button
          variant="outline"
          size="sm"
          onClick={resetFilters}
          className="h-8 text-xs"
        >
          Reset
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCsv(orders)}
          disabled={orders.length === 0}
          className="h-8 text-xs ml-auto"
        >
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground text-sm">No orders found.</p>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-3 font-medium whitespace-nowrap"
                    >
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          disabled={!header.column.getCanSort()}
                          className="flex items-center gap-1 hover:text-foreground transition-colors disabled:cursor-default"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-xs opacity-50">
                              {header.column.getIsSorted() === "asc"
                                ? "↑"
                                : header.column.getIsSorted() === "desc"
                                  ? "↓"
                                  : "↕"}
                            </span>
                          )}
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-border">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/30 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
            {data?.totalElements !== undefined && (
              <> &middot; {data.totalElements} orders</>
            )}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
