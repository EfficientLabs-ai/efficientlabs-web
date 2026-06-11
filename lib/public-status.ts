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
  };
};

export const PUBLIC_STATUS = data as PublicStatus;

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
