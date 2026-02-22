"use client";

import { useRouter, usePathname } from "next/navigation";
import { useRef, useTransition } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  MarketCategory,
  MarketStatus,
  MarketSummary,
  PagedResponse,
} from "@/types/markets";

interface MarketsTableProps {
  readonly markets: PagedResponse<MarketSummary>;
  readonly currentStatus: MarketStatus;
  readonly currentCategory?: MarketCategory;
  readonly currentPage: number;
  readonly currentSearch?: string;
}

const STATUS_TABS: { value: MarketStatus; label: string }[] = [
  { value: "OPEN", label: "Open" },
  { value: "CLOSED", label: "Closed" },
  { value: "SETTLED", label: "Settled" },
];

const CATEGORIES: { value: string; label: string }[] = [
  { value: "ALL", label: "All categories" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "POLITICS", label: "Politics" },
  { value: "SPORTS", label: "Sports" },
  { value: "FINANCE", label: "Finance" },
  { value: "SCIENCE", label: "Science" },
  { value: "ENTERTAINMENT", label: "Entertainment" },
  { value: "OTHER", label: "Other" },
];

function categoryLabel(category: MarketCategory): string {
  return (
    CATEGORIES.find((c) => c.value === category)?.label ?? category
  );
}

function statusVariant(
  status: MarketStatus
): "default" | "secondary" | "outline" {
  if (status === "OPEN") return "default";
  if (status === "SETTLED") return "outline";
  return "secondary";
}

function formatCloseTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs < 0) return `Closed ${date.toLocaleDateString()}`;
  const diffDays = Math.floor(diffMs / 86_400_000);
  if (diffDays > 0) return `${diffDays}d left`;
  const diffHours = Math.floor(diffMs / 3_600_000);
  if (diffHours > 0) return `${diffHours}h left`;
  const diffMins = Math.floor(diffMs / 60_000);
  return `${diffMins}m left`;
}

export function MarketsTable({
  markets,
  currentStatus,
  currentCategory,
  currentPage,
  currentSearch,
}: MarketsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function navigate(params: Record<string, string | undefined>) {
    const qs = new URLSearchParams();
    const merged = {
      status: currentStatus,
      category: currentCategory,
      page: String(currentPage),
      q: currentSearch,
      ...params,
    };
    for (const [key, val] of Object.entries(merged)) {
      if (val && val !== "ALL" && !(key === "page" && val === "0")) {
        qs.set(key, val);
      }
    }
    startTransition(() => {
      router.push(`${pathname}?${qs.toString()}`);
    });
  }

  function handleStatusTab(status: MarketStatus) {
    navigate({ status, page: "0" });
  }

  function handleCategory(value: string) {
    navigate({ category: value === "ALL" ? undefined : value, page: "0" });
  }

  function handleSearch(value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      navigate({ q: value || undefined, page: "0" });
    }, 400);
  }

  function handlePage(page: number) {
    navigate({ page: String(page) });
  }

  return (
    <div className="space-y-4">
      {/* Status tabs */}
      <div className="flex gap-1 border-b border-border">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              currentStatus === tab.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            placeholder="Search markets..."
            defaultValue={currentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={currentCategory ?? "ALL"}
          onValueChange={handleCategory}
        >
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {markets.content.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground text-sm">
          No markets found.
        </p>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Market</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">
                  Closes
                </th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {markets.content.map((market) => (
                <tr
                  key={market.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/app/markets/${market.id}`}
                      className="font-medium hover:underline line-clamp-2"
                    >
                      {market.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-muted-foreground text-xs">
                      {categoryLabel(market.category)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {formatCloseTime(market.closeTime)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(market.status)}>
                      {market.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {markets.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {markets.totalElements} market
            {markets.totalElements !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 0}
              onClick={() => handlePage(currentPage - 1)}
              className="px-3 py-1.5 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Previous
            </button>
            <span className="text-muted-foreground">
              {currentPage + 1} / {markets.totalPages}
            </span>
            <button
              disabled={currentPage >= markets.totalPages - 1}
              onClick={() => handlePage(currentPage + 1)}
              className="px-3 py-1.5 rounded border border-border disabled:opacity-40 hover:bg-muted transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
