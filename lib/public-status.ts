// The operating-layer proof tiles read from data/public-status.json — the
// artifact scripts/build-public-status.mjs emits from the operating layer's own
// telemetry. RENDER RULES (binding, from the artifact itself): only MEASURED
// values render as numbers; ESTIMATED renders only with its label; a null tile
// renders as "not measured" — never a guess, never a stale number styled live.
import data from "@/data/public-status.json";

export type TileLabel = "MEASURED" | "ESTIMATED" | null;

type TileBase = {
  label: TileLabel;
  /** when the SOURCE last changed (ISO-ish) — staleness is shown, never hidden. */
  updated_at?: string | null;
  /** how a stranger checks this number. */
  verify?: string;
  /** why a null tile is null. */
  reason?: string;
};

export type HeartbeatTile = TileBase & {
  color?: "GREEN" | "YELLOW" | "RED";
  fail?: number;
  warn?: number;
  ok?: number;
  checks?: { name: string; status: "ok" | "warn" | "fail" }[];
};
export type ReceiptsTile = TileBase & {
  count?: number;
  node_did?: string | null;
  bundle_path?: string;
};
export type RoutingTile = TileBase & {
  total?: number;
  rungs?: Record<string, number>;
  rung1_pct?: number;
  flagship_used?: number;
  flagship_avoided?: number;
  flagship_on_deterministic?: number;
  method?: string;
};
export type IntelligenceTile = TileBase & {
  counters?: Record<string, { value: number | string | null; label: TileLabel }>;
};
export type EconomicsTile = TileBase & {
  sessions?: number;
  requests?: number;
  weighted_cache_hit_pct?: number;
  method?: string;
};
export type ActivationTile = TileBase & {
  production?: number;
  total?: number;
  components?: { name: string; verdict: "PASS" | "PARTIAL" | "FAIL"; status: string }[];
};
export type ReadinessTile = TileBase & {
  overall_pct?: number;
  pillars?: {
    launch_gates: { pct: number; done: number; total: number };
    operating_components: { pct: number; production: number; total: number };
    product_capabilities: { pct: number; counted: number };
  };
  gates?: { id: string; label: string; done: boolean }[];
  method?: string;
};

export type PublicStatus = {
  format: string;
  generated_at: string;
  render_rules: string;
  tiles: {
    heartbeat: HeartbeatTile;
    receipts: ReceiptsTile;
    routing: RoutingTile;
    intelligence: IntelligenceTile;
    economics: EconomicsTile;
    activation: ActivationTile;
    readiness: ReadinessTile;
  };
};

// The committed artifact is the BUILD-TIME baseline + the fallback.
export const PUBLIC_STATUS = data as PublicStatus;

// The VPS cron pushes fresh artifacts to the `status-artifacts` branch (STATUS_PUBLISHER_CRON.md).
// getLiveStatus() fetches that at request time (ISR) so /status reflects the operating layer as it
// is RIGHT NOW, not as it was at the last deploy — without committing to main or redeploying.
// Fail-safe: any fetch/parse problem, or a payload that isn't our format, falls back to the
// committed baseline — never a blank page, never a fabricated number.
const LIVE_STATUS_URL =
  process.env.NEXT_PUBLIC_STATUS_FEED_URL ||
  "https://raw.githubusercontent.com/EfficientLabs-ai/efficientlabs-web/status-artifacts/data/public-status.json";

export async function getLiveStatus(): Promise<PublicStatus> {
  try {
    const res = await fetch(LIVE_STATUS_URL, { next: { revalidate: 300 } });
    if (!res.ok) return PUBLIC_STATUS;
    const live = (await res.json()) as PublicStatus;
    if (live?.format === PUBLIC_STATUS.format && live?.tiles && typeof live.generated_at === "string") {
      return live;
    }
    return PUBLIC_STATUS;
  } catch {
    return PUBLIC_STATUS;
  }
}

/** Hours since a tile's source updated; null when the tile carries no stamp. */
export function ageHours(updatedAt: string | null | undefined, now = Date.now()): number | null {
  if (!updatedAt) return null;
  const t = Date.parse(updatedAt);
  return Number.isFinite(t) ? (now - t) / 3_600_000 : null;
}

/** A tile older than 48h must degrade its copy to "last verified <date>" — never pretend liveness. */
export const STALE_AFTER_HOURS = 48;
export function isStale(updatedAt: string | null | undefined, now = Date.now()): boolean {
  const h = ageHours(updatedAt, now);
  return h !== null && h > STALE_AFTER_HOURS;
}
