export function isTokenExpired(token: string): boolean {
  try {
    const [, payload] = token.split(".");
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replaceAll("-", "+").replaceAll("_", "/")));
    const exp: number = decoded.exp;
    if (!exp) return true;
    return Date.now() / 1000 >= exp - 10;
  } catch {
    return true;
  }
}
