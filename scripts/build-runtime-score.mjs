#!/usr/bin/env node
/**
 * build-runtime-score.mjs — the Runtime Score emitter.
 * ============================================================================
 *
 * WHY THIS EXISTS
 * ---------------
 * The Runtime Score is the free acquisition surface:
 * six MEASURED-only sub-scores — Runtime · Continuity · Session · Cost ·
 * Ownership · Agent-Readiness — that show a visitor what their current setup
 * cannot prove. This script emits the artifact the FE renders:
 *
 *   data/runtime-score.json — six sub-score cards + a hero composite, each
 *                             carrying label "MEASURED" | null, a closed-vocab
 *                             verdict, the inputs with denominators, a stated
 *                             method, and a verify affordance.
 *
 * HONESTY / SAFETY INVARIANTS (binding — same discipline as public-status)
 * ---------------------------
 *   - MEASURED-only. Every input is derived from data/public-status.json —
 *     an artifact that is itself fail-closed (receipts chain-verified before
 *     publish, anonymization-gated) — or from the session-economics checker
 *     via an explicit field whitelist. Absent/unparseable source = the
 *     sub-score is { label: null, reason } — the page renders "not measured".
 *   - NO dollar figures. Cost is a routing-discipline PROXY and says so on
 *     the card ("$ not measured"). ESTIMATED figures (token-savings) are in
 *     the not_measured registry, never a card value.
 *   - Closed verdict vocabulary: GREEN | YELLOW | RED. Every verdict mapping
 *     is printed in the card's `method` — recomputable by anyone.
 *   - An anonymization gate scans the serialized output before any write.
 *     Violation = exit 1, nothing written.
 *
 * SOURCES
 * -------
 *   data/public-status.json      built immediately before this script by
 *                                build-public-status.mjs (same publisher run);
 *                                override with EFL_PUBLIC_STATUS for tests.
 *   EFL_SESSION_ECONOMICS_BIN    optional path to the operating layer's
 *                                session-economics checker; invoked as
 *                                `node <bin> check`, output whitelisted to
 *                                { level, recent_avg_ctx_per_req } only.
 *
 * USAGE
 *   node scripts/build-runtime-score.mjs              # write the artifact
 *   node scripts/build-runtime-score.mjs --check      # dry-run: print only
 *   node scripts/build-runtime-score.mjs --self-test  # fixture assertions
 * ============================================================================
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_STATUS = process.env.EFL_PUBLIC_STATUS || join(ROOT, "data/public-status.json");
const OUT_SCORE = join(ROOT, "data/runtime-score.json");
const CHECK = process.argv.includes("--check");
const SELF_TEST = process.argv.includes("--self-test");

const NOW = new Date().toISOString();

/** An honest null card: the page renders "not measured", never a guess. */
const notMeasured = (reason) => ({ label: null, reason });

/* Shape validation — a tile that CLAIMS "MEASURED" but is malformed must
 * degrade to a null card (fail-closed), never publish a half-invented state.
 * Numbers are required to be finite numbers (a "$12" string never flows
 * through); enums are closed. */
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const COLORS = new Set(["GREEN", "YELLOW", "RED"]);
const TILE_SHAPE = {
  heartbeat: (t) => COLORS.has(t.color) && isNum(t.fail) && isNum(t.warn) && isNum(t.ok),
  receipts: (t) => isNum(t.count) && t.count >= 0 && (t.bundle_path == null || typeof t.bundle_path === "string"),
  routing: (t) => isNum(t.total) && isNum(t.rung1_pct) && isNum(t.flagship_on_deterministic),
  economics: (t) => isNum(t.weighted_cache_hit_pct),
  activation: (t) => isNum(t.production) && isNum(t.total) && t.total > 0 && t.production <= t.total,
  readiness: (t) => Array.isArray(t.gates),
};
const isMeasured = (tile, shape) =>
  !!tile && tile.label === "MEASURED" && (!shape || (() => { try { return TILE_SHAPE[shape](tile); } catch { return false; } })());
const MALFORMED = (name) => `${name} tile claims MEASURED but is malformed — fail-closed to not-measured`;

/* ── session-economics probe (explicit field whitelist) ─────────────────── */
// The checker's raw output carries internal identifiers (transcript filename);
// ONLY the two public-safe numbers survive. Absent bin / failed run / bad
// shape = null — the Session card renders "not measured".
function readSessionEconomics() {
  const bin = process.env.EFL_SESSION_ECONOMICS_BIN;
  if (!bin || !existsSync(bin)) return null;
  try {
    const out = execFileSync(process.execPath, [bin, "check"], {
      env: process.env,
      maxBuffer: 4 * 1024 * 1024,
      timeout: 30_000, // a wedged checker must never hang the automated publisher
      killSignal: "SIGKILL",
    }).toString();
    const v = JSON.parse(out);
    // Whitelist + closed shape: level is a short ALL_CAPS token, the average a finite number.
    if (typeof v.level !== "string" || !/^[A-Z_]{1,32}$/.test(v.level) || !Number.isFinite(Number(v.recent_avg_ctx_per_req))) return null;
    return { level: v.level, recent_avg_ctx_per_req: Number(v.recent_avg_ctx_per_req) };
  } catch {
    return null;
  }
}

/* ── derivation (pure — fixture-testable) ───────────────────────────────── */
// Worst-of ordering for the hero composite.
const SEVERITY = { GREEN: 0, YELLOW: 1, RED: 2 };

export function deriveScores(status, sessionEcon) {
  const tiles = status?.tiles || {};
  const { heartbeat, receipts, routing, economics, activation, readiness } = tiles;
  const hermeticCi = isMeasured(readiness, "readiness")
    ? readiness.gates.find((g) => g && g.id === "hermetic-ci" && typeof g.label === "string") || null
    : null;

  /* 1 · Runtime — is the node healthy and is its software production-real. */
  const runtime = !isMeasured(heartbeat, "heartbeat")
    ? notMeasured(heartbeat?.label === "MEASURED" ? MALFORMED("heartbeat") : heartbeat?.reason || "heartbeat tile not measured in public-status source")
    : {
        label: "MEASURED",
        updated_at: heartbeat.updated_at || null,
        verdict: heartbeat.color,
        inputs: {
          heartbeat: { color: heartbeat.color, fail: heartbeat.fail, warn: heartbeat.warn, ok: heartbeat.ok },
          activation: isMeasured(activation, "activation")
            ? { production: activation.production, total: activation.total }
            : null,
          hermetic_ci_gate: hermeticCi ? { done: !!hermeticCi.done, label: hermeticCi.label } : null,
          ci_test_counts: null,
        },
        method:
          "verdict = the heartbeat run's own GREEN/YELLOW/RED, emitted verbatim; activation and the hermetic-CI launch gate shown with denominators; CI test COUNTS are not publicly instrumented and stay null",
        verify: "the live status page renders the same heartbeat tile — counts match this card",
      };

  /* 2 · Continuity — does work survive sessions as a verifiable chain. */
  // public-status only emits a MEASURED receipts tile after a fail-closed
  // chain + hybrid-signature replay, so MEASURED here IS chain-intact.
  const continuity = !isMeasured(receipts, "receipts")
    ? notMeasured(receipts?.label === "MEASURED" ? MALFORMED("receipts") : receipts?.reason || "receipts tile not measured in public-status source")
    : {
        label: "MEASURED",
        updated_at: receipts.updated_at || null,
        verdict: receipts.count > 0 ? "GREEN" : "YELLOW",
        inputs: { signed_receipts: receipts.count, chain_intact: true },
        method:
          "chain_intact = the publisher's fail-closed Ed25519+ML-DSA-65 chain replay passed (a bundle that fails is never published); verdict GREEN when ≥1 receipt is on the verified chain, YELLOW at 0",
        verify: receipts.bundle_path
          ? `re-verify the chain yourself: the published bundle at ${receipts.bundle_path}, in-browser or offline`
          : "published artifact",
      };

  /* 3 · Session — do sessions stay lean instead of compounding context. */
  const session = !sessionEcon
    ? notMeasured("session-economics checker not available on build machine")
    : {
        label: "MEASURED",
        updated_at: NOW,
        verdict: sessionEcon.level === "HEALTHY" ? "GREEN" : "YELLOW",
        inputs: {
          level: sessionEcon.level,
          context_per_request: sessionEcon.recent_avg_ctx_per_req,
          fixed_context_slimming: null,
        },
        method:
          "verdict GREEN when the session-economics checker reports HEALTHY, YELLOW otherwise; context-per-request is the checker's recent average; fixed-context slimming is ESTIMATED pending replication and is therefore null here",
        verify: "the operating layer's session-economics checker emits these fields verbatim",
      };

  /* 4 · Cost — routing-discipline PROXY; dollars are NOT measured. */
  const cost = !isMeasured(routing, "routing")
    ? notMeasured(routing?.label === "MEASURED" ? MALFORMED("routing") : routing?.reason || "routing tile not measured in public-status source")
    : {
        label: "MEASURED",
        footnote: "cost-discipline proxy (routing) — $ not measured",
        updated_at: routing.updated_at || null,
        verdict: routing.flagship_on_deterministic === 0 ? "GREEN" : "YELLOW",
        inputs: {
          rung1_pct: routing.rung1_pct,
          routed_total: routing.total,
          flagship_on_deterministic: routing.flagship_on_deterministic,
          weighted_cache_hit_pct: isMeasured(economics, "economics") ? economics.weighted_cache_hit_pct : null,
          dollars: null,
        },
        method:
          "verdict GREEN when zero deterministic units reached a flagship model, YELLOW otherwise; billing instrumentation is gated so no dollar figure exists anywhere in this artifact",
        verify: "the live status page's routing tile — histogram recomputable from the counts shown",
      };

  /* 5 · Ownership — portable, self-verifying evidence. */
  const ownership = !isMeasured(receipts, "receipts")
    ? notMeasured(receipts?.label === "MEASURED" ? MALFORMED("receipts") : receipts?.reason || "receipts tile not measured in public-status source")
    : {
        label: "MEASURED",
        updated_at: receipts.updated_at || null,
        verdict: receipts.count > 0 && receipts.bundle_path ? "GREEN" : "YELLOW",
        inputs: {
          signed_receipts: receipts.count,
          chain_intact: true,
          export_artifact: receipts.bundle_path || null,
        },
        method:
          "verdict GREEN when a verified chain with ≥1 receipt is published as a portable bundle a third party can verify offline, YELLOW otherwise",
        verify: "download the bundle and run the offline verifier — the verification layer needs no vendor in the loop",
      };

  /* 6 · Agent-Readiness — is the substrate agents need actually live. */
  const agentReadiness = !isMeasured(activation, "activation")
    ? notMeasured(activation?.label === "MEASURED" ? MALFORMED("activation") : activation?.reason || "activation tile not measured in public-status source")
    : {
        label: "MEASURED",
        updated_at: activation.updated_at || null,
        verdict:
          activation.production === activation.total && hermeticCi?.done
            ? "GREEN"
            : hermeticCi?.done && activation.production * 2 > activation.total
              ? "YELLOW"
              : "RED",
        inputs: {
          components_production: activation.production,
          components_total: activation.total,
          hermetic_ci_gate: hermeticCi ? { done: !!hermeticCi.done, label: hermeticCi.label } : null,
          rung1_pct: isMeasured(routing, "routing") ? routing.rung1_pct : null,
          ci_test_counts: null,
        },
        method:
          "verdict GREEN when every component is PRODUCTION and the hermetic-CI gate is done; YELLOW when CI is done and more than half are PRODUCTION; RED otherwise — non-PRODUCTION components are counted, never hidden",
        verify: "the live status page's activation matrix lists every component with its honest state",
      };

  const scores = {
    runtime,
    continuity,
    session,
    cost,
    ownership,
    agent_readiness: agentReadiness,
  };

  /* hero composite — composites MEASURED sub-scores only, denominator shown */
  const measured = Object.values(scores).filter((s) => isMeasured(s));
  const hero = {
    measured: measured.length,
    total: 6,
    verdict: measured.length
      ? measured.reduce((w, s) => (SEVERITY[s.verdict] > SEVERITY[w] ? s.verdict : w), "GREEN")
      : null,
    method:
      "worst verdict among measured sub-scores only; the denominator is shown ('N of 6 measured') — the ring never silently fills in for missing data",
  };

  return {
    format: "efl.runtime-score.v1",
    generated_at: NOW,
    render_rules:
      "MEASURED cards render values with verdicts; null cards render 'not measured' with the reason, greyed, in place — the grid shape never changes. Staleness is shown, never hidden.",
    hero,
    scores,
    not_measured_registry: [
      { what: "dollar cost", reason: "billing instrumentation gated — ESTIMATED figures exist internally and are never published" },
      { what: "fixed-context slimming", reason: "single-run ESTIMATED — replication needed before it can render as measured" },
      { what: "CI test counts", reason: "test totals are not publicly instrumented; only the hermetic-CI gate's done state is published" },
      { what: "nodes-online fleet counts", reason: "single-node today" },
      { what: "workflow completion counts", reason: "not publicly instrumented" },
    ],
  };
}

/* ── anonymization gate (fail-closed, before any write) ─────────────────── */
// Same pattern set as build-public-status.mjs. Any hit = abort, nothing written.
const FORBIDDEN = [
  [/sk-[A-Za-z0-9_-]{16,}/, "API-key shape"],
  [/ghp_[A-Za-z0-9]{20,}/, "GitHub token shape"],
  [/AKIA[0-9A-Z]{16}/, "AWS key shape"],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, "private key material"],
  [/\/home\/[a-z0-9_-]+/i, "home directory path"],
  [/\/opt\/[a-z0-9_/-]+/i, "infra path"],
  [/[a-z0-9-]+\.ts\.net/i, "private hostname"],
  [/\b(?!127\.0\.0\.1)(?:\d{1,3}\.){3}\d{1,3}\b/, "IP address"],
  [/[^\s"@]+@[^\s"@]+\.[a-z]{2,}/i, "email address"],
  [/tailscale|hostinger|solo-ai/i, "internal infra/upstream identifier"],
  [/\.jsonl|transcript/i, "internal telemetry identifier"],
];
function anonymizationGate(text) {
  return FORBIDDEN.flatMap(([re, why]) => {
    const m = re.exec(text);
    return m ? [`${why} ("${m[0].slice(0, 24)}…")`] : [];
  });
}

/* ── self-test (fixture-driven; no sources touched, nothing written) ────── */
function selfTest() {
  const fixture = {
    tiles: {
      heartbeat: { label: "MEASURED", updated_at: "2026-06-12T00:00Z", color: "GREEN", fail: 0, warn: 1, ok: 25 },
      receipts: { label: "MEASURED", updated_at: "2026-06-12T00:00Z", count: 3, bundle_path: "/proof/receipts-bundle.json" },
      routing: { label: "MEASURED", updated_at: "2026-06-12T00:00Z", total: 39, rung1_pct: 48.7, flagship_on_deterministic: 0 },
      economics: { label: "MEASURED", weighted_cache_hit_pct: 96 },
      activation: { label: "MEASURED", updated_at: "2026-06-12T00:00Z", production: 10, total: 13 },
      readiness: { label: "MEASURED", gates: [{ id: "hermetic-ci", label: "Hermetic CI green across all repos", done: true }] },
    },
  };
  const econ = { level: "HEALTHY", recent_avg_ctx_per_req: 60365 };
  const assert = (cond, msg) => {
    if (!cond) {
      console.error("self-test FAIL: " + msg);
      process.exit(1);
    }
  };

  // Full derivation: six cards, all measured, sensible verdicts.
  const full = deriveScores(fixture, econ);
  assert(Object.keys(full.scores).length === 6, "six sub-scores emitted");
  assert(full.hero.measured === 6 && full.hero.total === 6, "hero composites all six when all measured");
  assert(full.scores.runtime.verdict === "GREEN", "runtime verdict mirrors heartbeat color");
  assert(full.scores.continuity.verdict === "GREEN" && full.scores.continuity.inputs.chain_intact === true, "continuity GREEN on verified chain with receipts");
  assert(full.scores.session.verdict === "GREEN" && full.scores.session.inputs.context_per_request === 60365, "session whitelisted fields flow through");
  assert(full.scores.cost.verdict === "GREEN" && full.scores.cost.inputs.dollars === null, "cost GREEN at zero flagship-on-deterministic and never a dollar figure");
  assert(full.scores.cost.footnote.includes("$ not measured"), "cost carries the proxy footnote");
  assert(full.scores.ownership.verdict === "GREEN", "ownership GREEN when verified chain is exported");
  assert(full.scores.agent_readiness.verdict === "YELLOW", "agent-readiness YELLOW at 10/13 with CI done — never inflated to GREEN");
  assert(full.hero.verdict === "YELLOW", "hero is worst-of measured verdicts");
  assert(JSON.stringify(full).includes('"$') === false && !/\$\d/.test(JSON.stringify(full)), "no dollar amounts anywhere");

  // Partial: missing tiles degrade to honest nulls, hero denominator shrinks.
  const partial = deriveScores({ tiles: { heartbeat: fixture.tiles.heartbeat } }, null);
  assert(partial.scores.continuity.label === null && typeof partial.scores.continuity.reason === "string", "absent receipts → null card with reason");
  assert(partial.scores.session.label === null, "absent session-economics → null card");
  assert(partial.hero.measured === 1 && partial.hero.total === 6, "hero denominator stays 6, measured count honest");

  // Empty: nothing measured → no invented hero verdict.
  const empty = deriveScores({}, null);
  assert(empty.hero.measured === 0 && empty.hero.verdict === null, "nothing measured → hero verdict null, never invented");

  // Malformed-but-labelled-MEASURED tiles must fail closed to null cards —
  // a tile that CLAIMS measured never publishes a half-invented state.
  const poisoned = {
    tiles: {
      heartbeat: { label: "MEASURED", fail: 0, warn: 1, ok: 25 }, // color missing
      receipts: { label: "MEASURED", count: "abc", bundle_path: "/proof/receipts-bundle.json" }, // count not a number
      routing: { label: "MEASURED", total: 39, rung1_pct: "$12", flagship_on_deterministic: 0 }, // dollar-string number
      activation: { label: "MEASURED", production: 14, total: 13 }, // production > total
      readiness: { label: "MEASURED", gates: "not-an-array" },
    },
  };
  const bad = deriveScores(poisoned, null);
  for (const [k, s] of Object.entries(bad.scores)) {
    assert(s.label === null && typeof s.reason === "string", `malformed MEASURED ${k} source degrades to null card`);
  }
  assert(bad.hero.measured === 0 && bad.hero.verdict === null, "nothing survives malformed sources — hero never invents");
  assert(!/\$\d/.test(JSON.stringify(bad)), "dollar-shaped strings never flow through");
  // Closed verdict vocabulary on every measured card.
  for (const s of Object.values(full.scores)) {
    assert(s.label !== "MEASURED" || ["GREEN", "YELLOW", "RED"].includes(s.verdict), "verdict vocabulary is closed");
  }

  // Anonymization gate trips on poisoned content.
  assert(anonymizationGate('{"x":"/home/someone/secret"}').length > 0, "gate catches home paths");
  assert(anonymizationGate('{"x":"a-transcript-id.jsonl"}').length > 0, "gate catches internal telemetry identifiers");
  assert(anonymizationGate(JSON.stringify(full)).length === 0, "clean fixture output passes the gate");

  console.log("build-runtime-score: self-test OK (all assertions passed)");
}

/* ── main ───────────────────────────────────────────────────────────────── */
if (SELF_TEST) {
  selfTest();
  process.exit(0);
}

let status = null;
if (existsSync(SRC_STATUS)) {
  try {
    status = JSON.parse(readFileSync(SRC_STATUS, "utf8"));
  } catch {
    status = null;
  }
}
if (!status) {
  // Fail-closed: without the verified source artifact there is nothing honest
  // to derive — refuse to write a stale or invented score.
  console.error("build-runtime-score: data/public-status.json missing/unparseable — nothing written (fail-closed)");
  process.exit(1);
}

const score = deriveScores(status, readSessionEconomics());
const text = JSON.stringify(score, null, 2) + "\n";

const violations = anonymizationGate(text);
if (violations.length) {
  console.error("build-runtime-score: ANONYMIZATION GATE FAILED — nothing written:");
  for (const v of violations) console.error("  - " + v);
  process.exit(1);
}

const measuredKeys = Object.entries(score.scores).filter(([, s]) => s.label === "MEASURED").map(([k]) => k);
const nullKeys = Object.entries(score.scores).filter(([, s]) => s.label === null).map(([k]) => k);
console.log(
  `build-runtime-score: ${measuredKeys.length}/6 MEASURED [${measuredKeys.join(", ")}]` +
    (nullKeys.length ? ` · not-measured [${nullKeys.join(", ")}]` : "")
);

if (CHECK) {
  console.log(text);
  process.exit(0);
}
writeFileSync(OUT_SCORE, text);
console.log("wrote data/runtime-score.json");
