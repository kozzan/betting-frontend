import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "How resolution works",
};

export default function RulesPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <Link
        href="/app/markets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to markets
      </Link>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">How resolution works</h1>
        <p className="text-muted-foreground text-sm">
          Every market on this platform resolves to YES, NO, or VOID based on
          objective, verifiable criteria defined before trading opens.
        </p>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="font-medium text-base">Resolution criteria</h2>
          <p className="text-muted-foreground">
            Each market specifies its resolution criteria on the market detail
            page. These criteria are written before the market opens and cannot
            be changed once trading begins. Read the criteria carefully before
            placing a bet.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-base">Resolution sources</h2>
          <p className="text-muted-foreground">
            Where a market relies on a specific external source — such as an
            exchange price feed, an official government publication, or a
            recognised results body — that source is linked directly on the
            market page. We use the primary, authoritative source named in the
            criteria and do not substitute alternative sources after the fact.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-base">Outcomes</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>
              <span className="text-foreground font-medium">YES</span> — the
              stated event occurred within the specified conditions.
            </li>
            <li>
              <span className="text-foreground font-medium">NO</span> — the
              stated event did not occur, or the conditions were not met.
            </li>
            <li>
              <span className="text-foreground font-medium">VOID</span> — the
              market is cancelled (e.g. due to ambiguous or unavailable data).
              All stakes are refunded.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-base">Timing</h2>
          <p className="text-muted-foreground">
            Markets close at the time shown on the detail page. Resolution
            happens as soon as the outcome can be verified from the named
            source. Settlement (payout) follows resolution automatically.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-medium text-base">Disputes</h2>
          <p className="text-muted-foreground">
            If you believe a market has been resolved incorrectly, contact
            support within 48 hours of settlement with evidence. We review
            every dispute and, where warranted, will void the market and issue
            full refunds.
          </p>
        </section>
      </div>
    </div>
  );
}
