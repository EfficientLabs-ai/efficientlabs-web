// Runtime Score (efl.runtime-score.v1) — six MEASURED-only sub-scores emitted
// by the operating layer's B2 publisher. RENDER RULES (binding, from the
// artifact): MEASURED cards render values with verdicts; null cards render
// "not measured" with the reason, greyed, IN PLACE — the grid never reshapes.
// Staleness is shown, never hidden. No invented benchmarks, no $ figures.
import data from "@/data/runtime-score.json";

export type Verdict = "GREEN" | "YELLOW" | "RED";
const VERDICTS = new Set(["GREEN", "YELLOW", "RED"]);

// This artifact's label vocabulary is STRICTER than public-status: a sub-score
// is MEASURED or it is null. ESTIMATED figures are gated upstream and never
// appear here (spec hard rule) — so the type refuses them too.
export type ScoreLabel = "MEASURED" | null;

export type SubScore = {
  label: ScoreLabel;
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
  /** verdict is null in the fail-closed 0-of-N-measured case — render the grey state, never invent a color. */
  hero: { measured: number; total: number; verdict: Verdict | null; method: string };
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

export const SCORE_KEYS = ["runtime", "continuity", "session", "cost", "ownership", "agent_readiness"] as const;

/**
 * The render rules are only as honest as the payload that reaches the board —
 * so a live payload must pass the FULL contract, not a shape sniff: labels,
 * verdicts, the per-card inputs each headline renders from, and the string
 * safety of every field JSX will dereference. Any drift rejects the payload
 * and the committed baseline renders instead.
 */
const isStr = (v: unknown): v is string => typeof v === "string";
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const optStr = (v: unknown) => v === undefined || v === null || isStr(v);

/** What headlineScalar() needs per key for a MEASURED card to render a real value. */
const INPUTS_VALID: Record<(typeof SCORE_KEYS)[number], (i: Record<string, unknown>) => boolean> = {
  runtime: (i) => {
    const hb = i.heartbeat as Record<string, unknown> | undefined;
    return !!hb && isNum(hb.fail) && isNum(hb.warn) && isNum(hb.ok);
  },
  continuity: (i) => isNum(i.signed_receipts) && typeof i.chain_intact === "boolean",
  session: (i) => isNum(i.context_per_request) && isStr(i.level),
  cost: (i) => isNum(i.rung1_pct) && isNum(i.flagship_on_deterministic),
  ownership: (i) => typeof i.chain_intact === "boolean",
  agent_readiness: (i) => isNum(i.components_production) && isNum(i.components_total),
};

export function isValidRuntimeScore(x: unknown): x is RuntimeScore {
  const r = x as RuntimeScore;
  if (!r || r.format !== RUNTIME_SCORE.format || !isStr(r.generated_at)) return false;
  if (!r.hero || !isNum(r.hero.measured) || !isNum(r.hero.total) || !isStr(r.hero.method)) return false;
  if (r.hero.verdict !== null && !VERDICTS.has(r.hero.verdict)) return false;
  if (!r.scores) return false;
  for (const k of SCORE_KEYS) {
    const s = r.scores[k];
    if (!s) return false;
    if (s.label !== "MEASURED" && s.label !== null) return false;     // ESTIMATED/unknown never renders here
    // every field JSX dereferences must be string-safe regardless of label
    if (!optStr(s.updated_at) || !optStr(s.method) || !optStr(s.verify) || !optStr(s.footnote) || !optStr(s.reason)) return false;
    if (s.label === "MEASURED") {
      if (!VERDICTS.has(s.verdict as string)) return false;            // measured requires a real verdict
      if (!s.inputs || !INPUTS_VALID[k](s.inputs)) return false;       // …and the inputs its headline renders from
    }
  }
  if (!Array.isArray(r.not_measured_registry)) return false;
  for (const e of r.not_measured_registry) {
    if (!e || !isStr((e as { what?: unknown }).what) || !isStr((e as { reason?: unknown }).reason)) return false;
  }
  return true;
}

// The committed artifact is the BUILD-TIME baseline + the fallback.
export const RUNTIME_SCORE = data as RuntimeScore;

// Same live-feed pattern as public-status: the VPS cron pushes to the
// status-artifacts branch; request-time fetches track the layer
// between deploys. KNOWN LIMIT (recorded 2026-06-13): the repo is private, so
// the raw URL 404s until the founder opens a public artifacts mirror or feed —
// until then this deliberately serves the committed baseline, whose
// generated_at is rendered so the age is never hidden.
const LIVE_SCORE_URL =
  process.env.NEXT_PUBLIC_RUNTIME_SCORE_FEED_URL ||
  "https://raw.githubusercontent.com/EfficientLabs-ai/efficientlabs-web/status-artifacts/data/runtime-score.json";

export async function getLiveRuntimeScore(): Promise<RuntimeScore> {
  try {
    const res = await fetch(LIVE_SCORE_URL, { cache: "no-store" });
    if (!res.ok) return RUNTIME_SCORE;
    const live: unknown = await res.json();
    // full-contract validation — a drifted payload must not render dishonestly
    return isValidRuntimeScore(live) ? live : RUNTIME_SCORE;
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
