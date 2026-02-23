import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { NewsArticle } from "@/types/markets";

interface MarketNewsProps {
  readonly marketId: string;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(iso)
  );
}

function renderNewsContent(fetchError: boolean, articles: NewsArticle[]): ReactNode {
  if (fetchError) {
    return (
      <p className="text-sm text-muted-foreground px-4 py-3">
        Could not load news.
      </p>
    );
  }
  if (articles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-4 py-3">
        No recent news found.
      </p>
    );
  }
  return (
    <ul className="divide-y divide-border">
      {articles.map((article) => (
        <li key={article.id} className="px-4 py-3">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start justify-between gap-3 group"
          >
            <div className="space-y-0.5 min-w-0">
              <p className="text-sm font-medium leading-snug group-hover:underline">
                {article.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {article.source} · {relativeTime(article.publishedAt)}
              </p>
            </div>
            <ExternalLink className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          </a>
        </li>
      ))}
    </ul>
  );
}

export async function MarketNews({ marketId }: MarketNewsProps) {
  let articles: NewsArticle[] = [];
  let fetchError = false;

  try {
    articles = await apiRequest<NewsArticle[]>(`/api/v1/markets/${marketId}/news`);
  } catch {
    fetchError = true;
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        Latest News
      </h2>

      <div className="rounded-md border border-border overflow-hidden">
        {renderNewsContent(fetchError, articles)}
      </div>
    </div>
  );
}
