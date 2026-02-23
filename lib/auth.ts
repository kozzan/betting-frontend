export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(atob(payload.replaceAll("-", "+").replaceAll("_", "/")));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeJwtPayload(token);
  if (!decoded) return true;
  const exp = decoded.exp;
  if (typeof exp !== "number") return true;
  return Date.now() / 1000 >= exp - 10;
}
