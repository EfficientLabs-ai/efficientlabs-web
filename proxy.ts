import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Indexing policy by host:
//   - The real apex (efficientlabs.ai / www) is indexable — per-route metadata governs.
//   - Every other host (staging, preview, *.vercel.app) gets a hard X-Robots-Tag: noindex,
//     so drafts never leak into search or compete with production for ranking.
// This is host-based so NOTHING needs to change at publish time — moving the apex
// domain onto this project automatically flips the apex to indexable.
const APEX = "efficientlabs.ai";

const DASHBOARD_HOST = `dashboard.${APEX}`;

export function proxy(request: NextRequest) {
  // Prefer the externally-requested host (X-Forwarded-Host, first value) — behind
  // Vercel/any reverse proxy `Host` can be an internal address while the browser is
  // actually on efficientlabs.ai. Falling back to Host. Normalize: trim, lowercase,
  // strip port. Missing host fails CLOSED to noindex (safer than indexing a draft).
  const fwd = request.headers.get("x-forwarded-host");
  const raw = (fwd ? fwd.split(",")[0] : request.headers.get("host")) || "";
  const host = raw.trim().toLowerCase().split(":")[0];

  // Founder dashboard vanity host: dashboard.efficientlabs.ai/ → the gated /ops.
  // Clone nextUrl so the redirect keeps the public host (not an internal one).
  if (host === DASHBOARD_HOST && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/ops";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  const isApex = host === APEX || host === `www.${APEX}`;
  if (!isApex) {
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return res;
}

export const config = {
  // Run on everything except Next internals + static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
