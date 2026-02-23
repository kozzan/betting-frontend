"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, TrendingUp } from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCents } from "@/lib/format";
import { walletFetcher } from "@/lib/fetchers";

const NAV_LINKS = [
  { href: "/app/markets", label: "Markets" },
  { href: "/app/orders", label: "Orders" },
  { href: "/app/portfolio", label: "Portfolio" },
  { href: "/app/wallet", label: "Wallet" },
  { href: "/app/profile", label: "Profile" },
];

interface NavBarProps {
  readonly username?: string;
}

export function NavBar({ username }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: wallet } = useSWR("/api/wallet", walletFetcher, { refreshInterval: 30_000 });

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-6">
        <Link href="/app/markets" className="flex items-center gap-2 font-semibold text-sm">
          <TrendingUp className="size-4" />
          Betting
        </Link>
        <nav className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname.startsWith(href)
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        {wallet && (
          <span className="text-sm tabular-nums text-muted-foreground hidden sm:block">
            {formatCents(wallet.availableCents)}
          </span>
        )}
        {username && (
          <span className="text-sm text-muted-foreground hidden sm:block">{username}</span>
        )}
        <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
