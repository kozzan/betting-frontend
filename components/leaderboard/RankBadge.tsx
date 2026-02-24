interface RankBadgeProps {
  readonly rank: number;
}

const MEDALS: Record<number, string> = {
  1: "gold",
  2: "silver",
  3: "bronze",
};

const MEDAL_STYLES: Record<string, string> = {
  gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 font-bold",
  silver: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300 font-bold",
  bronze: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 font-bold",
};

const MEDAL_SYMBOLS: Record<string, string> = {
  gold: "#1",
  silver: "#2",
  bronze: "#3",
};

export function RankBadge({ rank }: RankBadgeProps) {
  const medal = MEDALS[rank];

  if (medal) {
    return (
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs ${MEDAL_STYLES[medal]}`}
        aria-label={`Rank ${rank}`}
      >
        {MEDAL_SYMBOLS[medal]}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs text-muted-foreground tabular-nums">
      {rank}
    </span>
  );
}
