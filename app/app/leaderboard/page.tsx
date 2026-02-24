import { cookies } from "next/headers";
import { decodeJwtPayload } from "@/lib/auth";
import { LeaderboardClient } from "@/components/leaderboard/LeaderboardClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard — Betting Platform",
  description: "See the top traders on the platform ranked by P&L.",
};

export default async function LeaderboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;
  const currentUserId = typeof decoded?.sub === "string" ? decoded.sub : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Top traders ranked by realised P&L.
        </p>
      </div>
      <LeaderboardClient currentUserId={currentUserId} />
    </div>
  );
}
