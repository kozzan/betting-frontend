import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { MarketRequestForm } from "@/components/markets/MarketRequestForm";

export default function NewMarketRequestPage() {
  return (
    <div className="max-w-2xl">
      <Link
        href="/app/markets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to markets
      </Link>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Request a Market</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Suggest a market you&apos;d like to see. Our team reviews all requests.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            Market requests are reviewed by our team within 2-3 business days. You&apos;ll be notified
            when your request is approved or if more information is needed.
          </p>
        </div>

        <MarketRequestForm />
      </div>
    </div>
  );
}
