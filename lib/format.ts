export async function getErrorMessage(res: Response): Promise<string> {
  let message = `Error ${res.status}`;
  try {
    const err = await res.json();
    message = (err?.message ?? err?.error ?? message) as string;
  } catch {
    // ignore parse error
  }
  return message;
}

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
