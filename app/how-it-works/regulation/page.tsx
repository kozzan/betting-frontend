import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, ExternalLink, Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Regulation & Responsible Gambling in Sweden | Betting Platform",
  description:
    "This platform is licensed by Spelinspektionen. Learn about our responsible gambling tools, age verification, self-exclusion via Spelpaus.se, and Swedish gambling law.",
  openGraph: {
    title: "Regulation & Responsible Gambling | Betting Platform",
    description:
      "Licensed by Spelinspektionen. Responsible gambling tools, age verification, and self-exclusion information for users in Sweden.",
    type: "website",
  },
};

export default function RegulationPage() {
  return (
    <article className="space-y-8">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Education
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Regulation &amp; Responsible Gambling</h1>
        <p className="text-muted-foreground leading-relaxed">
          This platform is licenced and regulated by <strong className="text-foreground">Spelinspektionen</strong>, the
          Swedish Gambling Authority. We take our regulatory obligations and our duty of care to users seriously.
        </p>
      </div>

      {/* Licence */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Swedish Gambling Licence</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          All prediction markets offered on this platform operate under a licence granted by
          Spelinspektionen in accordance with the <em>Spellag (2018:1138)</em>. Our licence covers
          skill-based and knowledge-based betting markets. The licence number is displayed in the footer
          of every page on this site.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Spelinspektionen supervises all licensed gambling operators in Sweden. You can verify our licence
          status and read our regulatory obligations on the Spelinspektionen website.
        </p>
        <a
          href="https://www.spelinspektionen.se"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Spelinspektionen.se
          <ExternalLink className="size-3.5" />
        </a>
      </section>

      {/* Age verification */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Age Verification — 18+</h2>
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
          <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            You must be at least <strong className="text-foreground">18 years old</strong> to register and trade on
            this platform. This is a legal requirement under Swedish law. We use identity verification to confirm your
            age and identity before activating your account. Providing false information during registration is a
            criminal offence.
          </p>
        </div>
      </section>

      {/* Responsible gambling tools */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Responsible Gambling Tools</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We offer a range of tools to help you stay in control of your gambling. You can access these at any time
          in your account profile under "Responsible Gambling".
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              title: "Deposit Limits",
              description:
                "Set daily, weekly, or monthly deposit limits. Once set, limits can only be decreased immediately; increases take 24 hours to take effect.",
            },
            {
              title: "Session Time Limits",
              description:
                "Receive a reminder notification when you have been actively trading for a set duration. Configure the interval in your profile.",
            },
            {
              title: "Loss Limits",
              description:
                "Cap how much you can lose over a rolling period. If your net loss reaches the limit, you will be unable to place new orders until the period resets.",
            },
            {
              title: "Cooling-off Period",
              description:
                "Take a break from trading for 1 day, 7 days, or 30 days. During a cooling-off period your account remains accessible but new orders are blocked.",
            },
          ].map(({ title, description }) => (
            <div key={title} className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="font-medium text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Spelpaus */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Self-Exclusion via Spelpaus.se</h2>
        <div className="rounded-lg border border-border bg-muted/30 p-5 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Spelpaus.se</strong> is Sweden's national self-exclusion register. If you
            register with Spelpaus, all licensed Swedish gambling operators — including this platform — are legally
            required to block your account. Self-exclusion takes effect within 24 hours and applies across the
            entire Swedish licensed gambling market.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Self-exclusion at Spelpaus is available for 1 month, 3 months, 1 year, or permanently. We strongly
            encourage any user who feels their gambling is getting out of control to use this service.
          </p>
          <a
            href="https://www.spelpaus.se"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Spelpaus.se
            <ExternalLink className="size-4" />
          </a>
        </div>
      </section>

      {/* Resources */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Responsible Gambling Resources</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          If gambling is causing problems for you or someone you know, free and confidential help is available:
        </p>
        <ul className="space-y-3 text-sm">
          {[
            {
              name: "Stödlinjen",
              description: "Sweden's national gambling helpline — free, anonymous support via phone or chat.",
              href: "https://www.stodlinjen.se",
              tel: "020-819 100",
            },
            {
              name: "Gamblers Anonymous Sweden",
              description: "Peer support groups for problem gamblers across Sweden.",
              href: "https://www.spelberoendesallskapet.se",
              tel: null,
            },
            {
              name: "Spelberoendes Riksförbund",
              description: "National association for problem gamblers offering counselling and support.",
              href: "https://www.spelberoendesallskapet.se",
              tel: null,
            },
          ].map(({ name, description, href, tel }) => (
            <li key={name} className="flex flex-col gap-0.5">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {name}
                <ExternalLink className="size-3" />
              </a>
              <span className="text-muted-foreground">{description}</span>
              {tel && (
                <a href={`tel:${tel.replaceAll(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Phone className="size-3" />
                  {tel}
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex items-center gap-4 pt-2 border-t border-border">
        <Link href="/how-it-works" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
          Back to overview
        </Link>
        <Link href="/app/markets" className="text-sm text-primary hover:underline">
          Browse markets
        </Link>
      </div>
    </article>
  );
}
