export function formatCents(cents: number, signed = false): string {
  const dollars = cents / 100;
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Math.abs(dollars));
  if (!signed) return formatted;
  if (cents > 0) return `+${formatted}`;
  if (cents < 0) return `-${formatted}`;
  return formatted;
}
