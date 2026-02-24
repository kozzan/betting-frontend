import Link from "next/link";
import { RankBadge } from "./RankBadge";
import { formatCents } from "@/lib/format";
import type { LeaderboardEntry } from "@/types/leaderboard";

interface LeaderboardTableProps {
  readonly entries: LeaderboardEntry[];
  readonly currentUserId?: string;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="py-3 px-4"><div className="h-4 w-8 rounded bg-muted animate-pulse" /></td>
      <td className="py-3 px-4"><div className="h-4 w-32 rounded bg-muted animate-pulse" /></td>
      <td className="py-3 px-4 text-right"><div className="h-4 w-20 rounded bg-muted animate-pulse ml-auto" /></td>
      <td className="py-3 px-4 text-right hidden sm:table-cell"><div className="h-4 w-12 rounded bg-muted animate-pulse ml-auto" /></td>
      <td className="py-3 px-4 text-right hidden sm:table-cell"><div className="h-4 w-16 rounded bg-muted animate-pulse ml-auto" /></td>
    </tr>
  );
}

export function LeaderboardTableSkeleton() {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b border-border">
            <th className="py-2.5 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide w-16">Rank</th>
            <th className="py-2.5 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">Trader</th>
            <th className="py-2.5 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide">P&L</th>
            <th className="py-2.5 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Trades</th>
            <th className="py-2.5 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 10 }, (_, i) => (
            <SkeletonRow key={`skeleton-${i}`} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center text-muted-foreground text-sm">
        No leaderboard data available for this period.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b border-border">
            <th className="py-2.5 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide w-16">Rank</th>
            <th className="py-2.5 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wide">Trader</th>
            <th className="py-2.5 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide">P&L</th>
            <th className="py-2.5 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Trades</th>
            <th className="py-2.5 px-4 text-right font-medium text-muted-foreground text-xs uppercase tracking-wide hidden sm:table-cell">Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isCurrentUser = currentUserId && entry.userId === currentUserId;
            let pnlColor = "";
            if (entry.pnlCents > 0) pnlColor = "text-emerald-600 dark:text-emerald-400";
            else if (entry.pnlCents < 0) pnlColor = "text-red-600 dark:text-red-400";

            return (
              <tr
                key={entry.userId}
                className={`border-b border-border last:border-0 transition-colors ${
                  isCurrentUser
                    ? "bg-primary/5 dark:bg-primary/10"
                    : "hover:bg-muted/30"
                }`}
              >
                <td className="py-3 px-4">
                  <RankBadge rank={entry.rank} />
                </td>
                <td className="py-3 px-4">
                  <Link
                    href={`/profile/${entry.username}`}
                    className="font-medium hover:underline underline-offset-2"
                  >
                    {entry.username}
                  </Link>
                  {isCurrentUser && (
                    <span className="ml-2 text-xs text-muted-foreground">(you)</span>
                  )}
                </td>
                <td className={`py-3 px-4 text-right tabular-nums font-medium ${pnlColor}`}>
                  {formatCents(entry.pnlCents, true)}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                  {entry.tradeCount}
                </td>
                <td className="py-3 px-4 text-right tabular-nums text-muted-foreground hidden sm:table-cell">
                  {(entry.winRate * 100).toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
