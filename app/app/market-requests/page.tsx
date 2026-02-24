import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MarketRequest, MarketRequestStatus } from "@/types/market-request";

function statusVariant(
  status: MarketRequestStatus
): "warning" | "success" | "destructive" {
  if (status === "PENDING") return "warning";
  if (status === "APPROVED") return "success";
  return "destructive";
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
}

export default async function MyMarketRequestsPage() {
  let requests: MarketRequest[] = [];
  try {
    const res = await apiRequest<MarketRequest[]>("/api/v1/market-requests/mine");
    requests = Array.isArray(res) ? res : [];
  } catch {
    // handled below
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/app/markets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to markets
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">My Market Requests</h1>
        <Button asChild size="sm">
          <Link href="/app/market-requests/new">New request</Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/30 px-8 py-16 text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            You haven&apos;t submitted any market requests yet.
          </p>
          <Button asChild>
            <Link href="/app/market-requests/new">Request a market</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Submitted</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium line-clamp-2">{req.title}</span>
                    {req.status === "REJECTED" && req.rejectionReason && (
                      <p className="text-xs text-destructive mt-1">
                        Rejection reason: {req.rejectionReason}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-muted-foreground text-xs">
                      {req.category.charAt(0) + req.category.slice(1).toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                    {formatDate(req.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(req.status)}>{req.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
