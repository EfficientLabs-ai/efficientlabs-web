// Runtime Score (efl.runtime-score.v1) — six MEASURED-only sub-scores emitted
// by the operating layer's B2 publisher. RENDER RULES (binding, from the
// artifact): MEASURED cards render values with verdicts; null cards render
// "not measured" with the reason, greyed, IN PLACE — the grid never reshapes.
// Staleness is shown, never hidden. No invented benchmarks, no $ figures.
import data from "@/data/runtime-score.json";
import type { TileLabel } from "@/lib/public-status";

export type Verdict = "GREEN" | "YELLOW" | "RED";

export type SubScore = {
  label: TileLabel;
  updated_at?: string | null;
  verdict?: Verdict;
  /** e.g. the cost card's "cost-discipline proxy (routing) — $ not measured" */
  footnote?: string;
  inputs?: Record<string, unknown>;
  method?: string;
  verify?: string;
  reason?: string;
};

export type RuntimeScore = {
  format: string;
  generated_at: string;
  render_rules: string;
  hero: { measured: number; total: number; verdict: Verdict; method: string };
  scores: {
    runtime: SubScore;
    continuity: SubScore;
    session: SubScore;
    cost: SubScore;
    ownership: SubScore;
    agent_readiness: SubScore;
  };
  not_measured_registry: { what: string; reason: string }[];
};

// The committed artifact is the BUILD-TIME baseline + the fallback.
export const RUNTIME_SCORE = data as RuntimeScore;

// Same live-feed pattern as public-status: the VPS cron pushes to the
// status-artifacts branch; ISR fetches it so the score tracks the layer
// between deploys. KNOWN LIMIT (recorded 2026-06-13): the repo is private, so
// the raw URL 404s until the founder opens a public artifacts mirror or feed —
// until then this deliberately serves the committed baseline, whose
// generated_at is rendered so the age is never hidden.
const LIVE_SCORE_URL =
  process.env.NEXT_PUBLIC_RUNTIME_SCORE_FEED_URL ||
  "https://raw.githubusercontent.com/EfficientLabs-ai/efficientlabs-web/status-artifacts/data/runtime-score.json";

export async function getLiveRuntimeScore(): Promise<RuntimeScore> {
  try {
    const res = await fetch(LIVE_SCORE_URL, { next: { revalidate: 300 } });
    if (!res.ok) return RUNTIME_SCORE;
    const live = (await res.json()) as RuntimeScore;
    if (live?.format === RUNTIME_SCORE.format && live?.scores && typeof live.generated_at === "string") {
      return live;
    }
    return RUNTIME_SCORE;
  } catch {
    return RUNTIME_SCORE;
  }
}

/** Display order + titles (3 per row; cost carries its proxy footnote). */
export const SCORE_ORDER = [
  ["runtime", "Runtime"],
  ["continuity", "Continuity"],
  ["session", "Session"],
  ["cost", "Cost"],
  ["ownership", "Ownership"],
  ["agent_readiness", "Agent-Readiness"],
] as const;

/**
 * The headline scalar per card (P5: scalar first). Pulled from the artifact's
 * inputs with NO computation beyond formatting — the artifact is the truth.
 */
type ScoreInputs = {
  heartbeat?: { fail?: number; warn?: number; ok?: number };
  signed_receipts?: number;
  chain_intact?: boolean;
  level?: string;
  context_per_request?: number;
  rung1_pct?: number;
  flagship_on_deterministic?: number;
  components_production?: number;
  components_total?: number;
};

export function headlineScalar(key: (typeof SCORE_ORDER)[number][0], s: SubScore): { value: string; caption: string } {
  const i = (s.inputs || {}) as ScoreInputs;
  switch (key) {
    case "runtime":
      return i.heartbeat
        ? { value: `${i.heartbeat.fail ?? "—"}/${i.heartbeat.warn ?? "—"}/${i.heartbeat.ok ?? "—"}`, caption: "heartbeat fail / warn / ok" }
        : { value: "—", caption: "heartbeat" };
    case "continuity":
      return { value: String(i.signed_receipts ?? "—"), caption: i.chain_intact ? "signed receipts · chain intact" : "signed receipts" };
    case "session":
      return {
        value: typeof i.context_per_request === "number" ? `${Math.round(i.context_per_request / 1000)}K` : "—",
        caption: `context per request · ${String(i.level ?? "").toLowerCase() || "level unmeasured"}`,
      };
    case "cost":
      return { value: typeof i.rung1_pct === "number" ? `${i.rung1_pct}%` : "—", caption: `work on rung-1 scripts · flagship-on-deterministic ${i.flagship_on_deterministic ?? "—"}` };
    case "ownership":
      return { value: i.chain_intact === true ? "portable" : "—", caption: "evidence bundle verifies offline, no vendor in the loop" };
    case "agent_readiness":
      return {
        value: typeof i.components_production === "number" ? `${i.components_production} of ${i.components_total}` : "—",
        caption: "substrate components PRODUCTION",
      };
  }
}

/**
 * Conversion bridge (spec §3): a low (non-GREEN) measured sub-score surfaces a
 * tier OUTCOME-framed — never priced here. GREEN cards surface nothing.
 */
export const BRIDGE: Record<(typeof SCORE_ORDER)[number][0], { tier: string; line: string }> = {
  cost: { tier: "Exos Pro", line: "Routing discipline: deterministic work stops reaching flagship models." },
  session: { tier: "Exos Pro", line: "Context per request goes down, measurably." },
  continuity: { tier: "Apex", line: "Receipt chains across agent handoffs." },
  runtime: { tier: "Apex Max", line: "One mesh, every node heartbeating." },
  ownership: { tier: "Teams / Enterprise", line: "Compliance-ready evidence for the whole team — auditability by architecture." },
  agent_readiness: { tier: "Free Forever", line: "StratosAgent is free forever — install it and light this card up." },
};
