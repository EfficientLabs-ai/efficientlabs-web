import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Founder-gate auth for /ops. Server-only (Node runtime). Set BOTH:
 *   - OPS_PASSWORD — the login password
 *   - OPS_SECRET   — an independent, high-entropy HMAC key (NOT the password)
 * If either is missing the gate fails closed (no access). The cookie holds an
 * opaque HMAC-signed token (never the password); all secret comparisons are
 * constant-time AND length-blind. Interim until Supabase founder-role auth.
 */
const PASSWORD = process.env.OPS_PASSWORD || "";
const SECRET = process.env.OPS_SECRET || ""; // REQUIRED + independent of the password
const TTL_MS = 8 * 60 * 60 * 1000; // 8h
export const OPS_COOKIE = "ops_session";

/**
 * Constant-time, length-blind equality: HMAC both inputs to fixed-length (32B)
 * digests with the server secret, then timingSafeEqual. Neither the length nor
 * the content of either side leaks via timing. Fails closed without a secret.
 */
function safeEqual(a: string, b: string): boolean {
  if (!SECRET) return false;
  const ha = createHmac("sha256", SECRET).update(a, "utf8").digest();
  const hb = createHmac("sha256", SECRET).update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

/** Constant-time password check. False unless both password + secret are configured. */
export function passwordOk(input: string): boolean {
  return PASSWORD.length > 0 && SECRET.length > 0 && safeEqual(input, PASSWORD);
}

/** Mint an opaque signed session token: `<exp>.<hmac(exp)>`. */
export function mintSession(): string {
  const exp = String(Date.now() + TTL_MS);
  const sig = createHmac("sha256", SECRET).update(exp).digest("hex");
  return `${exp}.${sig}`;
}

/** Verify a session token's signature (constant-time) and expiry. Fails closed without a secret. */
export function sessionOk(token: string | undefined): boolean {
  if (!token || !SECRET) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = createHmac("sha256", SECRET).update(exp).digest("hex");
  return safeEqual(sig, expected);
}
