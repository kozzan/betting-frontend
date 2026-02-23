"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MarketComment } from "@/types/markets";

interface MarketCommentsProps {
  readonly marketId: string;
  readonly isAuthenticated: boolean;
  readonly currentUserId?: string;
}

async function commentsFetcher(url: string): Promise<MarketComment[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load comments");
  const json: unknown = await res.json();
  if (Array.isArray(json)) return json as MarketComment[];
  const jsonObj = json as Record<string, unknown>;
  return Array.isArray(jsonObj.data) ? (jsonObj.data as MarketComment[]) : [];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function MarketComments({ marketId, isAuthenticated, currentUserId }: MarketCommentsProps) {
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const optimisticIdRef = useRef(0);

  const { data: comments, error, mutate, isLoading } = useSWR<MarketComment[]>(
    `/api/markets/${marketId}/comments`,
    commentsFetcher,
    { refreshInterval: 15_000 }
  );

  async function handlePost() {
    const trimmed = body.trim();
    if (!trimmed || posting) return;

    setPostError(null);
    setPosting(true);

    const optimisticId = `optimistic-${++optimisticIdRef.current}`;
    const optimistic: MarketComment = {
      id: optimisticId,
      marketId,
      userId: currentUserId ?? "",
      username: "You",
      body: trimmed,
      createdAt: new Date().toISOString(),
    };

    await mutate(
      (current) => [...(current ?? []), optimistic],
      { revalidate: false }
    );
    setBody("");

    try {
      const res = await fetch(`/api/markets/${marketId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: trimmed }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? "Failed to post comment");
      }
      await mutate();
    } catch (err) {
      await mutate(
        (current) => (current ?? []).filter((c) => c.id !== optimisticId),
        { revalidate: false }
      );
      setBody(trimmed);
      setPostError(err instanceof Error ? err.message : "Failed to post comment");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(commentId: string) {
    if (deletingIds.has(commentId)) return;
    setDeletingIds((prev) => new Set(prev).add(commentId));
    setDeleteError(null);

    const snapshot = comments;
    await mutate(
      (current) => (current ?? []).filter((c) => c.id !== commentId),
      { revalidate: false }
    );
    try {
      const res = await fetch(`/api/markets/${marketId}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      await mutate();
    } catch (err) {
      await mutate(snapshot, { revalidate: false });
      setDeleteError(err instanceof Error ? err.message : "Failed to delete comment");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(commentId);
        return next;
      });
    }
  }

  return (
    <div className="space-y-4">
      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <p className="text-sm text-muted-foreground">Failed to load comments.</p>
      )}

      {/* Empty state */}
      {!isLoading && !error && (comments?.length ?? 0) === 0 && (
        <p className="text-sm text-muted-foreground">
          No comments yet. Be the first to start the discussion.
        </p>
      )}

      {/* Comment list */}
      {!isLoading && !error && (comments?.length ?? 0) > 0 && (
        <ul className="space-y-4">
          {(comments ?? []).map((comment) => (
            <li key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium select-none">
                {comment.username.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.username}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
                  {comment.userId === currentUserId && (
                    <button
                      type="button"
                      aria-label="Delete comment"
                      disabled={deletingIds.has(comment.id)}
                      onClick={() => handleDelete(comment.id)}
                      className="ml-auto text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed break-words">{comment.body}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Delete error */}
      {deleteError && (
        <p className="text-xs text-destructive">{deleteError}</p>
      )}

      {/* Compose area */}
      {isAuthenticated ? (
        <div className="space-y-2 pt-2">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            aria-label="Write a comment"
            placeholder="Write a comment..."
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[4.5rem] max-h-[7.5rem]"
          />
          {postError && (
            <p className="text-xs text-destructive">{postError}</p>
          )}
          <Button
            size="sm"
            disabled={!body.trim() || posting}
            onClick={handlePost}
          >
            {posting ? "Posting..." : "Post"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground pt-2">
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to join the discussion.
        </p>
      )}
    </div>
  );
}
