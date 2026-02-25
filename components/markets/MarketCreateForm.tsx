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
import type { MarketCategory } from "@/types/markets";

interface FormState {
  title: string;
  description: string;
  resolutionCriteria: string;
  resolutionSourceUrl: string;
  closeTime: string;
  category: MarketCategory | "";
}

const INITIAL_STATE: FormState = {
  title: "",
  description: "",
  resolutionCriteria: "",
  resolutionSourceUrl: "",
  closeTime: "",
  category: "",
};

export function MarketCreateForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.description.trim()) next.description = "Description is required";
    if (!form.resolutionCriteria.trim()) next.resolutionCriteria = "Resolution criteria is required";
    if (!form.closeTime) {
      next.closeTime = "Close time is required";
    } else if (new Date(form.closeTime) <= new Date()) {
      next.closeTime = "Close time must be in the future";
    }
    if (form.resolutionSourceUrl.trim()) {
      try {
        new URL(form.resolutionSourceUrl.trim());
      } catch {
        next.resolutionSourceUrl = "Please enter a valid URL";
      }
    }
    if (!form.category) next.category = "Category is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          resolutionCriteria: form.resolutionCriteria.trim(),
          resolutionSourceUrl: form.resolutionSourceUrl.trim() || null,
          closeTime: new Date(form.closeTime).toISOString(),
          category: form.category,
        }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      toast.success("Market submitted for review");
      router.push("/app/my-markets");
    } catch {
      toast.error("Something went wrong. Please try again.");
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
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g. Will BTC reach $100k by end of 2025?"
          disabled={submitting}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Provide context for the market..."
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
          value={form.resolutionCriteria}
          onChange={(e) => setField("resolutionCriteria", e.target.value)}
          placeholder="How will this market be resolved?"
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
          value={form.resolutionSourceUrl}
          onChange={(e) => setField("resolutionSourceUrl", e.target.value)}
          placeholder="https://..."
          disabled={submitting}
        />
        {errors.resolutionSourceUrl && (
          <p className="text-xs text-destructive">{errors.resolutionSourceUrl}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="closeTime">Close Time</Label>
        <Input
          id="closeTime"
          type="datetime-local"
          value={form.closeTime}
          onChange={(e) => setField("closeTime", e.target.value)}
          disabled={submitting}
        />
        {errors.closeTime && <p className="text-xs text-destructive">{errors.closeTime}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select
          value={form.category}
          onValueChange={(val) => setField("category", val as MarketCategory)}
          disabled={submitting}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {MARKET_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit for review"}
      </Button>
    </form>
  );
}
