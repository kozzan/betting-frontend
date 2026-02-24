"use client";

import { useState } from "react";
import Link from "next/link";
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
  category: MarketCategory | "";
  proposedCloseTime: string;
}

const INITIAL_STATE: FormState = {
  title: "",
  description: "",
  resolutionCriteria: "",
  category: "",
  proposedCloseTime: "",
};

export function MarketRequestForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) next.title = "Title is required";
    if (!form.resolutionCriteria.trim()) next.resolutionCriteria = "Resolution criteria is required";
    if (!form.category) next.category = "Category is required";
    if (!form.proposedCloseTime) {
      next.proposedCloseTime = "Proposed close date is required";
    } else if (new Date(form.proposedCloseTime) <= new Date()) {
      next.proposedCloseTime = "Proposed close date must be in the future";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/market-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          resolutionCriteria: form.resolutionCriteria.trim(),
          category: form.category,
          closeTime: new Date(form.proposedCloseTime).toISOString(),
        }),
      });
      if (!res.ok) {
        toast.error(await getErrorMessage(res));
        return;
      }
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-8 text-center space-y-4">
        <div className="text-2xl">Request submitted</div>
        <p className="text-sm text-muted-foreground">
          Your market request has been submitted and is pending review. Our team will get back to you
          within 2-3 business days.
        </p>
        <div className="flex justify-center gap-3 pt-2">
          <Button asChild variant="outline">
            <Link href="/app/market-requests">View my requests</Link>
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setForm(INITIAL_STATE);
              setErrors({});
              setSubmitted(false);
            }}
          >
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          What question should this market answer?
        </p>
        <Input
          id="title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="e.g. Will the Fed cut rates before July 2026?"
          disabled={submitting}
        />
        {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          Describe the event in detail
        </p>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Provide additional context..."
          rows={3}
          className={TEXTAREA_CLASS}
          disabled={submitting}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">
          Category <span className="text-destructive">*</span>
        </Label>
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
                {c.charAt(0) + c.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="resolutionCriteria">
          Resolution Criteria <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs text-muted-foreground">
          How will this market be resolved?
        </p>
        <textarea
          id="resolutionCriteria"
          value={form.resolutionCriteria}
          onChange={(e) => setField("resolutionCriteria", e.target.value)}
          placeholder="e.g. This market resolves YES if the Federal Reserve announces a rate cut before July 1, 2026."
          rows={3}
          className={TEXTAREA_CLASS}
          disabled={submitting}
        />
        {errors.resolutionCriteria && (
          <p className="text-xs text-destructive">{errors.resolutionCriteria}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposedCloseTime">
          Proposed Close Date <span className="text-destructive">*</span>
        </Label>
        <Input
          id="proposedCloseTime"
          type="date"
          value={form.proposedCloseTime}
          onChange={(e) => setField("proposedCloseTime", e.target.value)}
          disabled={submitting}
        />
        {errors.proposedCloseTime && (
          <p className="text-xs text-destructive">{errors.proposedCloseTime}</p>
        )}
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Request"}
      </Button>
    </form>
  );
}
