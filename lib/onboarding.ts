// Onboarding journey data — ATMOS_ONBOARDING_V1 (carries ONBOARDING_SPEC_V2
// forward verbatim). The activation event is unchanged: the user's own node
// produces a receipt and the user SEES it verify. Binding anti-patterns: no
// wizard overlays, no confetti, completion is quiet; no fake data — the only
// demo is the live status page; no prices in onboarding surfaces.
import type { RuntimeScore } from "@/lib/runtime-score";

/**
 * The 5-step GET RUNNING checklist. Step semantics are V2's (5 steps; pairing
 * is the only account-bound one; completion is quiet). COMMANDS are the site's
 * existing install canon (/install page + docs) — one canonical flow, never
 * two. The spec's `npm i -g` step-1 wording is under live verification
 * (quickstart lane); if that lands as the true path, /install and this list
 * change TOGETHER.
 */
export const CHECKLIST = [
  {
    n: 1, title: "Install",
    cmd: "curl -fsSL https://efficientlabs.ai/install.sh | sh",
    cmdWin: "irm https://efficientlabs.ai/install.ps1 | iex",
    note: "user-space, no sudo, nothing auto-starts — same commands as the install page (macOS/Linux above, Windows below)",
    sovereign: true,
  },
  { n: 2, title: "First run", cmd: "stratos init", note: "sets up your node locally; keys are generated on your machine and sealed", sovereign: true },
  { n: 3, title: "Pair your node", cmd: "stratos pair", note: "the ONLY account-bound step — everything else works without one", sovereign: false },
  { n: 4, title: "First receipt", cmd: "stratos receipt export", note: "run any local task first — the install page walks a full demo task; the export is your evidence bundle", sovereign: true },
  { n: 5, title: "Verify it", cmd: "stratos receipt verify bundle.json", note: "or drop the bundle on the web verifier (/status#verify) — read locally, never uploaded", sovereign: true },
] as const;

/** Self-segmentation — one question, three answers, framing only (the 5 steps never change). */
export const SEGMENTS = [
  { id: "personal", label: "A personal node", framing: "The default path. Steps 1–2 and 4–5 need no account at all.", later: "Free Forever → Exos Pro" },
  { id: "team", label: "A team mesh", framing: "Same five steps — you can invite teammates after step 3, not before.", later: "Exos Pro → Apex / Teams" },
  { id: "enterprise", label: "An enterprise fleet", framing: "Same five steps on your first node; fleet docs cover the rest when you're ready.", later: "Teams → Enterprise" },
] as const;
export type SegmentId = (typeof SEGMENTS)[number]["id"];

/**
 * The visitor's grey Runtime Score — the §2.2 aha BEFORE install: six cards in
 * their designed "not measured" state, each with one teach-line on what lights
 * it up. This object passes the same full-contract validator the live artifact
 * does; nothing here is fake data — it is the honest shape of "no node yet".
 */
export const GREY_SCORE: RuntimeScore = {
  format: "efl.runtime-score.v1",
  generated_at: "",
  render_rules: "visitor state: nothing measured yet — every card says what would light it up",
  hero: { measured: 0, total: 6, verdict: null, method: "no node paired — the ring composites measured sub-scores only, so it shows nothing rather than something invented" },
  scores: {
    runtime: { label: null, reason: "Your node's heartbeat lights this up — install is step 1." },
    continuity: { label: null, reason: "Your first receipt lights this up." },
    session: { label: null, reason: "Pair a node and run one task — your context meter starts here." },
    cost: { label: null, reason: "Routing telemetry lights this up after your first routed task." },
    ownership: { label: null, reason: "Export your first bundle — receipt #1 makes your evidence portable." },
    agent_readiness: { label: null, reason: "StratosAgent installs free — step 1 lights the substrate." },
  },
  not_measured_registry: [],
};
