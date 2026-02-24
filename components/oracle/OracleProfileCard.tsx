import { ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import type { OracleProfile } from "@/types/oracle";

interface OracleProfileCardProps {
  readonly profile: OracleProfile;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(iso));
}

export function OracleProfileCard({ profile }: OracleProfileCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{profile.username}</h1>
              <Badge variant="info" className="flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Verified Oracle
              </Badge>
            </div>
            {profile.verifiedAt && (
              <p className="text-xs text-muted-foreground">
                Verified since {formatDate(profile.verifiedAt)}
              </p>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed pt-2">
            {profile.bio}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-2xl font-semibold tabular-nums">{profile.resolvedMarkets}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Markets Resolved</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-2xl font-semibold tabular-nums">{profile.activeMarkets}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Active Markets</p>
          </div>
          {profile.accuracy !== undefined && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-2xl font-semibold tabular-nums">
                {profile.accuracy.toFixed(0)}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Accuracy</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
