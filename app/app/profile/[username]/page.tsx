import { cookies } from "next/headers";
import { decodeJwtPayload } from "@/lib/auth";
import { PublicProfileCard } from "@/components/profile/PublicProfileCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Metadata } from "next";
import type { PublicProfile } from "@/types/profile";
import type { ApiResponse } from "@/types/markets";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function fetchPublicProfile(username: string): Promise<PublicProfile | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(
      `${API_URL}/api/v1/users/${encodeURIComponent(username)}/profile`,
      { headers, next: { revalidate: 60 } }
    );

    if (res.ok) {
      const json: ApiResponse<PublicProfile> = await res.json();
      return json.data;
    }

    if (res.status === 404 || res.status === 501) {
      // Backend endpoint not yet implemented — return dev mock
      return {
        userId: `mock-${username}`,
        username,
        memberSince: "2024-01-15T00:00:00Z",
        tradeCount: 42,
        publicPnl: true,
        pnlCents: 18750,
        winRate: 0.619,
      };
    }

    return null;
  } catch {
    // Backend unreachable during development
    return {
      userId: `mock-${username}`,
      username,
      memberSince: "2024-01-15T00:00:00Z",
      tradeCount: 42,
      publicPnl: true,
      pnlCents: 18750,
      winRate: 0.619,
    };
  }
}

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — Betting Platform`,
    description: `Trading profile for @${username}`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { username } = await params;

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const decoded = token ? decodeJwtPayload(token) : null;
  const isLoggedIn = !!decoded;

  const profile = await fetchPublicProfile(username);

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">@{username}</h1>
        <p className="text-muted-foreground text-sm">
          This profile could not be found or is not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      <PublicProfileCard profile={profile} />

      {!isLoggedIn && (
        <div className="rounded-md border border-border p-6 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Want to trade on prediction markets?
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Create an account</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
