"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  readonly marketId: string;
  readonly className?: string;
}

export function WatchlistButton({ marketId, className }: WatchlistButtonProps) {
  const { isWatched, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isPending, setIsPending] = useState(false);

  const watched = isWatched(marketId);

  async function handleToggle() {
    setIsPending(true);
    try {
      if (watched) {
        await removeFromWatchlist(marketId);
      } else {
        await addToWatchlist(marketId);
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      disabled={isPending}
      title={watched ? "Remove from watchlist" : "Add to watchlist"}
      className={cn("shrink-0", className)}
    >
      <Star
        className={cn(
          "size-4 transition-colors",
          watched
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground hover:text-yellow-400"
        )}
      />
    </Button>
  );
}
