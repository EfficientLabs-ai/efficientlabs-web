// ============================================================================
// lib/analytics.ts — provider-agnostic, swappable client analytics.
//
// We deliberately DO NOT hard-commit a vendor (Segment, PostHog, GA, …). The
// founder picks the vendor at deploy time; this module only defines the call
// site — `track(event, props?)` — and a tiny sink interface a vendor adapter
// can implement later without touching any component.
//
// SINK SELECTION (env, read at module load — public by design, no secrets):
//   NEXT_PUBLIC_ANALYTICS_SINK = "off"      → no-op everywhere (default in prod)
//                              = "console"  → console.debug (default in dev)
//                              = "beacon"   → POST {event, props, ts} to
//                                             NEXT_PUBLIC_ANALYTICS_ENDPOINT via
//                                             navigator.sendBeacon (fetch fallback)
//
// To wire a real vendor later: implement `AnalyticsSink.track` (e.g. call
// posthog.capture / analytics.track) and register it via `setAnalyticsSink`,
// or add a branch in `resolveSink`. Components never change.
//
// Guarantees: SSR-safe (no-op on the server), never throws into the UI, never
// sends PII it isn't given. Events are a closed, documented union below.
// ============================================================================

export type AnalyticsEvent =
  | "cta_click" // a primary call-to-action was clicked
  | "payment_link_click" // an outbound Stripe Payment Link was clicked (Pricing)
  | "signup_submit" // the email/password signup form was submitted
  | "checkout_activated"; // the buyer landed on /welcome post-checkout

export type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;

export interface AnalyticsSink {
  track(event: AnalyticsEvent, props?: AnalyticsProps): void;
}

const noopSink: AnalyticsSink = { track() {} };

const consoleSink: AnalyticsSink = {
  track(event, props) {
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, props ?? {});
  },
};

function beaconSink(endpoint: string): AnalyticsSink {
  return {
    track(event, props) {
      const payload = JSON.stringify({ event, props: props ?? {}, ts: Date.now() });
      try {
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          navigator.sendBeacon(endpoint, new Blob([payload], { type: "application/json" }));
        } else {
          void fetch(endpoint, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Analytics must never break the page.
      }
    },
  };
}

function resolveSink(): AnalyticsSink {
  // Server-side: never track. The call sites are all client interactions anyway.
  if (typeof window === "undefined") return noopSink;

  const mode = process.env.NEXT_PUBLIC_ANALYTICS_SINK?.toLowerCase();
  const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

  switch (mode) {
    case "off":
      return noopSink;
    case "console":
      return consoleSink;
    case "beacon":
      return endpoint ? beaconSink(endpoint) : consoleSink;
    default:
      // No explicit sink configured → console in dev (so events are visible
      // while building), no-op in production (so nothing leaks to a vendor the
      // founder hasn't chosen).
      return process.env.NODE_ENV === "production" ? noopSink : consoleSink;
  }
}

let sink: AnalyticsSink | null = null;

/** Swap the sink at runtime (e.g. a vendor adapter loaded after consent). */
export function setAnalyticsSink(custom: AnalyticsSink): void {
  sink = custom;
}

/**
 * Record an analytics event. Safe to call from anywhere on the client; a no-op
 * on the server and whenever no sink is configured. Never throws.
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  try {
    if (!sink) sink = resolveSink();
    sink.track(event, props);
  } catch {
    // Analytics must never break the page.
  }
}
