import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { apiRequest } from "@/lib/api";
import type { ApiResponse, NewsArticle } from "@/types/markets";

interface MarketNewsProps {
  readonly marketId: string;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(iso)
  );
}

function safeArticleUrl(url: string): string | null {
  try {
    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:" ? url : null;
  } catch {
    return null;
  }
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
      {articles.map((article) => {
        const href = safeArticleUrl(article.url);
        return (
          <li key={article.id} className="px-4 py-3">
            {href ? (
              <a
                href={href}
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
            ) : (
              <div className="space-y-0.5">
                <p className="text-sm font-medium leading-snug">{article.title}</p>
                <p className="text-xs text-muted-foreground">
                  {article.source} · {relativeTime(article.publishedAt)}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export async function MarketNews({ marketId }: MarketNewsProps) {
  let articles: NewsArticle[] = [];
  let fetchError = false;

  try {
    const res = await apiRequest<ApiResponse<NewsArticle[]>>(`/api/v1/markets/${marketId}/news`);
    articles = res.data;
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
