import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Trade Prediction Markets | Betting Platform",
  description:
    "A step-by-step guide to placing trades on prediction markets: creating an account, browsing markets, placing limit orders, and managing risk.",
  openGraph: {
    title: "How to Trade Prediction Markets | Betting Platform",
    description:
      "Step-by-step guide to placing your first trade on a prediction market — from account creation to settlement.",
    type: "website",
  },
};

const STEPS = [
  {
    number: "01",
    title: "Create an account and deposit funds",
    body: `Register with a valid email address and complete identity verification (required by Swedish gambling law for all users aged 18+). Once verified, navigate to the Wallet page and make a deposit. Funds are held in your wallet balance in cents — 100 cents equals $1.00.`,
  },
  {
    number: "02",
    title: "Browse markets",
    body: `Go to the Markets page to explore open markets. You can filter by category (Sports, Politics, Crypto, Finance, Science, Entertainment) or search by keyword. Each market card shows the title, current probability, and closing time. Click any market to see the full description, resolution criteria, order book, and price history.`,
  },
  {
    number: "03",
    title: "Place a limit order",
    body: `On the market detail page, choose YES or NO, enter your price in cents (1–99), and your quantity. A limit order executes only at your specified price or better — you will never pay more than you offer. Your funds are reserved when you submit the order and returned if the order is cancelled or expires unfilled.`,
  },
  {
    number: "04",
    title: "Your order matches with another trader",
    body: `The platform's matching engine pairs your order with a resting order on the opposite side at a compatible price. When a match occurs, both parties receive their contracts immediately. You can track all open and filled orders on the Orders page.`,
  },
  {
    number: "05",
    title: "Manage your position",
    body: `You can close or reduce your position at any time before the market closes by placing a sell order. If you hold YES contracts and want to exit, place a sell YES order into the order book. Your profit or loss is the difference between your entry price and exit price, multiplied by your quantity.`,
  },
  {
    number: "06",
    title: "Settlement",
    body: `After the market closes, platform operators verify the outcome against the published resolution criteria. Winning contracts pay 100 cents each directly to your wallet. Losing contracts expire at 0 cents. Settlement is automatic and typically completes within minutes of the resolution being confirmed.`,
  },
];

export default function HowToTradePage() {
  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Education
        </p>
        <h1 className="text-2xl font-bold tracking-tight">How to Trade</h1>
        <p className="text-muted-foreground leading-relaxed">
          Trading on prediction markets is straightforward once you understand the mechanics. Follow these six steps from
          account creation to settlement.
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {STEPS.map(({ number, title, body }) => (
          <div key={number} className="flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{number}</span>
            </div>
            <div className="space-y-1.5 pt-1.5">
              <h2 className="font-semibold text-sm">{title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Example walkthrough */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Example trade walkthrough</h2>
        <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-4 text-sm">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Scenario:</strong> The market "Will the central bank raise rates in March?" is
            trading at YES 40 cents / NO 60 cents. You believe the rate hike is more likely than 40% — you think the true
            probability is around 60%.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>You place a limit buy order: <strong className="text-foreground">YES at 42 cents, quantity 100</strong>. Total cost: 4,200 cents ($42.00), reserved from your wallet.</li>
            <li>Another trader, who believes the hike probability is below 42%, sells NO at 58 cents (equivalent to selling YES at 42 cents). The orders match.</li>
            <li>You receive <strong className="text-foreground">100 YES contracts</strong> at 42 cents each.</li>
            <li>The central bank raises rates. The market resolves YES.</li>
            <li>You receive <strong className="text-foreground">10,000 cents ($100.00)</strong> — your 100 contracts at 100 cents each.</li>
            <li>Your profit: <strong className="text-foreground">$100 − $42 = $58.00</strong> on a $42 outlay — a 138% return.</li>
          </ol>
          <p className="text-muted-foreground">
            If the bank had held rates, your YES contracts would expire at 0 and you would lose your $42 stake.
          </p>
        </div>
      </section>

      {/* Risk management */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Risk management tips</h2>
        <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
          <li>
            <strong className="text-foreground">Size positions carefully.</strong> Never risk more on a single market than you
            are comfortable losing. A 60% probability still means a 40% chance of a complete loss on that contract.
          </li>
          <li>
            <strong className="text-foreground">Diversify.</strong> Spread your capital across multiple independent markets.
            A portfolio of accurate small bets outperforms concentrated big bets over time.
          </li>
          <li>
            <strong className="text-foreground">Check resolution criteria before trading.</strong> Make sure you understand
            exactly what condition must be met for YES to resolve. Ambiguous criteria have led to VOID resolutions in the past.
          </li>
          <li>
            <strong className="text-foreground">Use limit orders, not market orders.</strong> Limit orders protect you from
            paying a worse price than intended. In thin markets, the spread can be wide.
          </li>
          <li>
            <strong className="text-foreground">Set deposit limits.</strong> Use the responsible gambling tools in your
            profile to cap how much you deposit per day, week, or month.
          </li>
        </ul>
      </section>

      <div className="flex items-center gap-4 pt-2">
        <Link
          href="/how-it-works/regulation"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Next: Regulation & Responsible Gambling
          <ChevronRight className="size-3.5" />
        </Link>
        <Link href="/app/markets" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          Browse markets
        </Link>
      </div>
    </article>
  );
}
