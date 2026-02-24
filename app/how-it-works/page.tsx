import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp, Users, Trophy, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How Prediction Markets Work | Betting Platform",
  description:
    "Learn how prediction markets work, how to trade YES and NO contracts, and how prices reflect the crowd's probability estimates.",
  openGraph: {
    title: "How Prediction Markets Work | Betting Platform",
    description:
      "Learn how prediction markets work, how to trade YES and NO contracts, and how prices reflect the crowd's probability estimates.",
    type: "website",
  },
};

const FEATURE_CARDS = [
  {
    icon: TrendingUp,
    title: "Make Predictions",
    description:
      "Browse markets on real-world events and buy YES or NO contracts based on your view of the outcome.",
  },
  {
    icon: Users,
    title: "Trade with Others",
    description:
      "Your order is matched with another trader who disagrees. The market price reflects the collective belief of all participants.",
  },
  {
    icon: Trophy,
    title: "Profit from Accuracy",
    description:
      "When the market settles, winning contracts pay out 100 cents each. The more accurate your predictions, the more you earn.",
  },
];

const CONTENT_SECTIONS = [
  {
    title: "What are Prediction Markets?",
    body: `A prediction market is a trading platform where contracts pay out based on real-world outcomes. Each contract asks a yes-or-no question — "Will X happen by date Y?" — and trades between 0 and 100 cents. The current price is the market's best estimate of the probability that the event occurs.

Unlike traditional betting, you are not betting against the house. You trade directly with other participants who hold the opposite view.`,
    link: "/how-it-works/what-are-prediction-markets",
    linkLabel: "Deep dive into prediction markets",
  },
  {
    title: "How to Trade",
    body: `Trading on this platform works like a limit-order market. You choose a side (YES or NO), a price (1–99 cents), and a quantity. When another trader accepts your price from the other side, the trade executes. You can exit your position at any time before the market closes by selling your contracts back into the order book.`,
    link: "/how-it-works/how-to-trade",
    linkLabel: "Step-by-step trading guide",
  },
  {
    title: "Prices as Probabilities",
    body: `If a YES contract trades at 65 cents, the market collectively estimates a 65% probability that the event will happen. This is the "wisdom of crowds" — the aggregated knowledge of all traders produces a price that tends to be more accurate than any individual forecast.

Prices update continuously as new information arrives. A breaking news story, a poll result, or a policy announcement will cause traders to revise their views, which immediately moves the price.`,
    link: "/how-it-works/what-are-prediction-markets",
    linkLabel: "Learn more about market prices",
  },
  {
    title: "Regulation in Sweden",
    body: `This platform operates under a licence issued by Spelinspektionen, the Swedish Gambling Authority. All users must be at least 18 years old and pass identity verification before trading. We provide responsible gambling tools including deposit limits, session reminders, and self-exclusion via Spelpaus.se.`,
    link: "/how-it-works/regulation",
    linkLabel: "Regulation & responsible gambling",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">How Prediction Markets Work</h1>
        <p className="text-muted-foreground leading-relaxed max-w-2xl">
          Prediction markets let you trade on the outcomes of real-world events. Prices reflect collective probability estimates,
          and accurate forecasters earn real returns. Here is everything you need to get started.
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {FEATURE_CARDS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="rounded-lg border border-border p-5 space-y-3">
            <div className="size-9 rounded-md bg-primary/10 flex items-center justify-center">
              <Icon className="size-5 text-primary" />
            </div>
            <h2 className="font-semibold text-sm">{title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        ))}
      </div>

      {/* Content sections */}
      <div className="space-y-8">
        {CONTENT_SECTIONS.map(({ title, body, link, linkLabel }) => (
          <section key={title} className="space-y-3">
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="space-y-3">
              {body.split("\n\n").map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-sm text-muted-foreground leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            <Link
              href={link}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {linkLabel}
              <ChevronRight className="size-3.5" />
            </Link>
          </section>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-lg border border-border bg-muted/30 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold">Ready to trade?</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create your account and start making predictions today.
          </p>
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shrink-0"
        >
          Create your account
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
