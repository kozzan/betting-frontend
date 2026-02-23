"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getErrorMessage } from "@/lib/format";
import { MARKET_CATEGORIES, TEXTAREA_CLASS } from "@/lib/markets";
import type { Market, MarketCategory } from "@/types/markets";

function toDatetimeLocal(iso: string): string {
  return new Date(iso).toISOString().slice(0, 16);
}

interface MarketEditFormProps {
  readonly market: Market;
}

export function MarketEditForm({ market }: MarketEditFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(market.title);
  const [description, setDescription] = useState(market.description);
  const [resolutionCriteria, setResolutionCriteria] = useState(market.resolutionCriteria);
  const [resolutionSourceUrl, setResolutionSourceUrl] = useState(market.resolutionSourceUrl ?? "");
  const [closeTime, setCloseTime] = useState(toDatetimeLocal(market.closeTime));
  const [category, setCategory] = useState<MarketCategory>(market.category);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = "Title is required";
    if (!description.trim()) next.description = "Description is required";
    if (!resolutionCriteria.trim()) next.resolutionCriteria = "Resolution criteria is required";
    if (!closeTime) {
      next.closeTime = "Close time is required";
    } else if (new Date(closeTime) <= new Date()) {
      next.closeTime = "Close time must be in the future";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/markets/${market.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          resolutionCriteria: resolutionCriteria.trim(),
          resolutionSourceUrl: resolutionSourceUrl.trim() || null,
          closeTime: new Date(closeTime).toISOString(),
          category,
        }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      toast.success("Market updated");
      router.push("/app/my-markets");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={submitting}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={TEXTAREA_CLASS}
          disabled={submitting}
        />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resolutionCriteria">Resolution Criteria</Label>
        <textarea
          id="resolutionCriteria"
          value={resolutionCriteria}
          onChange={(e) => setResolutionCriteria(e.target.value)}
          rows={3}
          className={TEXTAREA_CLASS}
          disabled={submitting}
        />
        {errors.resolutionCriteria && (
          <p className="text-xs text-destructive">{errors.resolutionCriteria}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resolutionSourceUrl">
          Resolution Source URL{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="resolutionSourceUrl"
          type="url"
          value={resolutionSourceUrl}
          onChange={(e) => setResolutionSourceUrl(e.target.value)}
          placeholder="https://..."
          disabled={submitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="closeTime">Close Time</Label>
        <Input
          id="closeTime"
          type="datetime-local"
          value={closeTime}
          onChange={(e) => setCloseTime(e.target.value)}
          disabled={submitting}
        />
        {errors.closeTime && <p className="text-xs text-destructive">{errors.closeTime}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(val) => setCategory(val as MarketCategory)}
          disabled={submitting}
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MARKET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/app/my-markets")}
          disabled={submitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
