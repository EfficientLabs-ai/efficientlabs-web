import type { NextConfig } from "next";

// ── Content-Security-Policy ───────────────────────────────────────────────────
// Shipped REPORT-ONLY first (per production-readiness plan) so it can't break the
// live site — the browser reports violations without enforcing. Tighten against
// real reports, then promote to an enforcing `Content-Security-Policy` header.
//
// Allowed origins (self + Vercel + self-hosted fonts + the services the client
// actually talks to):
//   - 'self'                      first-party app, self-hosted fonts (app/fonts), media
//   - Vercel                      vercel.live + *.vercel-insights.com (preview toolbar / web-vitals)
//   - Supabase                    *.supabase.co over https + wss (auth + realtime)
//   - Stripe                      js.stripe.com (script), buy.stripe.com (checkout links/frame)
//   - Cal.com                     cal.com + *.cal.com (the inline scheduler iframe)
//   - GitHub                      api.github.com + raw.githubusercontent.com (live activity fetch)
// 'unsafe-inline' is permitted for script/style because the app ships small
// pre-paint inline scripts (theme + intro gate, JSON-LD) and inline styles; a
// nonce-based tightening is a follow-up once Report-Only is clean.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://buy.stripe.com",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://vercel.live https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self' data: blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.github.com https://raw.githubusercontent.com https://*.vercel-insights.com https://cal.com",
  "frame-src 'self' https://cal.com https://*.cal.com https://buy.stripe.com https://js.stripe.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Start non-enforcing so a bad directive can't white-screen production.
  // Promote to "Content-Security-Policy" once reports are clean.
  { key: "Content-Security-Policy-Report-Only", value: csp },
  // Legacy clickjacking guard (CSP frame-ancestors is the modern equivalent; we ship both).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  },
  // 2 years, includeSubDomains + preload. HTTPS-only is already true on Vercel.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  devIndicators: false,
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Apply to every route (pages, API, and /public assets).
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      // Consolidate the signed-in home: /app (the OS) is canonical; the older
      // /dashboard control plane redirects to it so there's one control plane.
      { source: "/dashboard", destination: "/app", permanent: true },
    ];
  },
};

export default nextConfig;
