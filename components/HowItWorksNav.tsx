"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const EDUCATION_LINKS = [
  { href: "/how-it-works", label: "Overview" },
  { href: "/how-it-works/what-are-prediction-markets", label: "What are Prediction Markets?" },
  { href: "/how-it-works/how-to-trade", label: "How to Trade" },
  { href: "/how-it-works/regulation", label: "Regulation & Responsible Gambling" },
];

export function HowItWorksNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-8 space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3">
        Education
      </p>
      {EDUCATION_LINKS.map(({ href, label }) => {
        const isActive =
          href === "/how-it-works"
            ? pathname === "/how-it-works"
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "block px-3 py-2 rounded-md text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
