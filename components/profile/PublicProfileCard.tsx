import { UserAvatar } from "./UserAvatar";
import { formatCents } from "@/lib/format";
import type { PublicProfile } from "@/types/profile";

interface PublicProfileCardProps {
  readonly profile: PublicProfile;
}

function StatItem({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-semibold tabular-nums">{value}</span>
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
  );
}

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const memberSince = new Date(profile.memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  let pnlColor = "";
  if (profile.pnlCents !== undefined && profile.pnlCents > 0) pnlColor = "text-emerald-600 dark:text-emerald-400";
  else if (profile.pnlCents !== undefined && profile.pnlCents < 0) pnlColor = "text-red-600 dark:text-red-400";

  return (
    <div className="rounded-md border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <UserAvatar username={profile.username} size="lg" />
        <div>
          <h2 className="text-xl font-semibold">@{profile.username}</h2>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-around gap-4">
          <StatItem label="Trades" value={String(profile.tradeCount)} />

          {profile.publicPnl && profile.winRate !== undefined ? (
            <StatItem
              label="Win Rate"
              value={`${(profile.winRate * 100).toFixed(1)}%`}
            />
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-semibold text-muted-foreground">—</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</span>
            </div>
          )}

          {profile.publicPnl && profile.pnlCents !== undefined ? (
            <div className="flex flex-col items-center gap-0.5">
              <span className={`text-xl font-semibold tabular-nums ${pnlColor}`}>
                {formatCents(profile.pnlCents, true)}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">P&L</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-xl font-semibold text-muted-foreground">Private</span>
              <span className="text-xs text-muted-foreground uppercase tracking-wide">P&L</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
