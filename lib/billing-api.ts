export const OWNER_AUTH_COOKIE = "el_session";

const billingApiBase = process.env.BILLING_API_BASE_URL;

export function billingUrl(path: string): string | null {
  if (!billingApiBase) return null;
  return new URL(path, billingApiBase.endsWith("/") ? billingApiBase : `${billingApiBase}/`).toString();
}

export function sessionCookieMaxAge(value: unknown): number {
  const maxAge = Number(value || 3600);
  return Number.isFinite(maxAge) && maxAge > 0 ? maxAge : 3600;
}
