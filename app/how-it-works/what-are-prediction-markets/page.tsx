import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "What are Prediction Markets? | Betting Platform",
  description:
    "A detailed explanation of prediction markets: binary contracts, YES/NO outcomes, how prices encode probability, and why they work.",
  openGraph: {
    title: "What are Prediction Markets? | Betting Platform",
    description:
      "Learn how prediction markets use binary contracts to aggregate information and produce accurate probability forecasts.",
    type: "website",
  },
};

export default function WhatArePredictionMarketsPage() {
  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Education
        </p>
        <h1 className="text-2xl font-bold tracking-tight">What are Prediction Markets?</h1>
        <p className="text-muted-foreground leading-relaxed">
          Prediction markets are exchange-traded contracts whose payouts depend on real-world outcomes. They have been studied
          by economists for decades and are used by governments, corporations, and researchers to produce accurate probability forecasts.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Binary Contracts</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Every market on this platform is a <strong className="text-foreground">binary contract</strong>: it resolves to
          either YES or NO based on an objective, verifiable criterion. A YES contract that resolves correctly pays exactly
          100 cents. A NO contract that resolves correctly also pays 100 cents. If your contract resolves against you, it
          expires worthless at 0 cents.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This simple structure means every contract has a clear, unambiguous value at settlement. There are no complex
          payoff tables or accumulator rules — you are simply speculating on the probability of a binary event.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The YES / NO Relationship</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          YES and NO contracts are complementary. Because one of them must pay 100 cents and the other 0 cents, the
          two prices always sum to 100 cents (ignoring the spread). If YES is trading at 72 cents, NO is trading at
          roughly 28 cents. You can take either side of any market.
        </p>
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm space-y-2">
          <p className="font-medium">Example market: "Will Team X win the championship?"</p>
          <ul className="space-y-1 text-muted-foreground list-disc list-inside">
            <li>YES trades at 72 cents — the crowd gives Team X a 72% chance of winning.</li>
            <li>NO trades at 28 cents — the crowd gives all other outcomes a combined 28% chance.</li>
            <li>If Team X wins, YES contracts pay 100 cents and NO contracts expire at 0.</li>
            <li>If Team X does not win, NO contracts pay 100 cents and YES contracts expire at 0.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Prices as Probability</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A rational trader will only buy a YES contract if they believe the true probability of the event exceeds the
          asking price. If you think Team X has a 80% chance of winning but YES is priced at 72 cents, you can buy YES
          and capture an expected profit of 8 cents per contract. This profit motive causes prices to converge toward
          the true probability as traders exploit any mispricing.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This is why prediction market prices are treated as probability estimates rather than just bets. The price
          at any moment is the market's best estimate of the likelihood that the described event will occur.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">The Wisdom of Crowds</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A well-functioning prediction market aggregates information from all participants. A trader with insider
          knowledge of a team's injury report, a political pollster who reads regional data closely, or an economist
          tracking macro indicators — each can express their edge by trading, and the collective price incorporates
          all of this dispersed information.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Research has consistently shown that prediction markets outperform individual expert forecasts, polls, and
          statistical models across a wide range of domains including election outcomes, economic indicators, and
          scientific replication rates.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Why They Work</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Three properties make prediction markets reliable:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>
            <strong className="text-foreground">Skin in the game.</strong> Traders risk real money, which disciplines
            forecasts. You cannot make overconfident predictions without paying a price for being wrong.
          </li>
          <li>
            <strong className="text-foreground">Continuous updating.</strong> Prices change instantly as new information
            arrives, unlike surveys or reports that are published on fixed schedules.
          </li>
          <li>
            <strong className="text-foreground">Diverse participation.</strong> Many independent participants with different
            information and models produce a price that no single forecaster could match alone.
          </li>
        </ol>
      </section>

      <div className="flex items-center gap-4 pt-2">
        <Link
          href="/how-it-works/how-to-trade"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Next: How to Trade
          <ChevronRight className="size-3.5" />
        </Link>
        <Link href="/register" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          Create an account
        </Link>
      </div>
    </article>
  );
}
