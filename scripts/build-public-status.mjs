#!/usr/bin/env node
/**
 * build-public-status.mjs — the OPERATING-LAYER proof publisher.
 * ============================================================================
 *
 * WHY THIS EXISTS
 * ---------------
 * The activity feed proves we SHIP (commits). This script proves the system
 * RUNS: it reads the operating layer's own telemetry on the build machine and
 * emits two public artifacts the /status page renders:
 *
 *   data/public-status.json          — one JSON with every proof tile's data,
 *                                      a generated_at stamp, and a per-tile
 *                                      label: "MEASURED" | "ESTIMATED" | null
 *   public/proof/receipts-bundle.json — the signed capability-receipt bundle
 *                                      (public key embedded) that VISITORS
 *                                      re-verify in their own browser
 *
 * HONESTY / SAFETY INVARIANTS (binding — inherit the claim-ledger discipline)
 * ---------------------------
 *   - MEASURED-only numbers. A tile whose source is absent/unparseable is
 *     written as { label: null } — the page renders "not measured". NEVER a
 *     cached number styled as live, NEVER an invented value.
 *   - NO dollar figures, NO model names (internal routing tiers are published
 *     as "flagship"/"rung" terminology only), NO file paths, NO hostnames.
 *   - The receipts bundle is verified HERE (fail-closed) before it is written;
 *     a bundle that does not verify is NOT published.
 *   - An anonymization gate scans the serialized output for secret shapes and
 *     internal identifiers before anything is written. Violation = exit 1,
 *     nothing written.
 *   - Every tile carries `verify`: how a stranger checks the number (a
 *     runnable command where one exists, otherwise the published artifact).
 *
 * SOURCES (all OPTIONAL — absent source = honest null tile)
 * ---------
 * Configured by env so no internal path ships in this public repo:
 *   EFL_OPS_STATUS_DIR   directory holding the operating layer's status files
 *                        (heartbeat / completion-check / telemetry snapshots)
 *   EFL_STRATOS_BIN      path to the stratos CLI entry (bin/stratos.js) used
 *                        to export the receipt bundle
 *   STRATOS_NODE_KEYS / STRATOS_RECEIPTS  passed through to the CLI
 *   EFL_RECEIPTS_BUNDLE  alternative: a pre-exported bundle file to publish
 *
 * USAGE
 *   node scripts/build-public-status.mjs           # write both artifacts
 *   node scripts/build-public-status.mjs --check   # dry-run: print, write nothing
 * ============================================================================
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash, createPublicKey, verify as edVerify } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_STATUS = join(ROOT, "data/public-status.json");
const OUT_BUNDLE = join(ROOT, "public/proof/receipts-bundle.json");
const CHECK = process.argv.includes("--check");

const OPS = process.env.EFL_OPS_STATUS_DIR || null;
const opsFile = (name) => (OPS && existsSync(join(OPS, name)) ? readFileSync(join(OPS, name), "utf8") : null);

// One captured "now" — every tile stamps generated_at from its SOURCE where the
// source carries a timestamp; this is only the artifact's own stamp.
const NOW = new Date().toISOString();

/** An honest null tile: the page renders "not measured", never a guess. */
const notMeasured = (reason) => ({ label: null, reason });

/* ── 1 · heartbeat ──────────────────────────────────────────────────────── */
// Parses the heartbeat status file: "**Health: YELLOW** (0 fail / 2 warn / 24 ok)"
// + the check table. Publishes check NAMES + status only — notes stay internal.
// Internal routing-tier terminology is normalized to "flagship" for the public
// surface (terminology only; no value is altered).
function readHeartbeat() {
  const md = opsFile("HEARTBEAT_STATUS.md");
  if (!md) return notMeasured("heartbeat source not present on build machine");
  const head = /^# HEARTBEAT — (.+)$/m.exec(md);
  const health = /\*\*Health: (GREEN|YELLOW|RED)\*\* \((\d+) fail \/ (\d+) warn \/ (\d+) ok\)/.exec(md);
  if (!health) return notMeasured("heartbeat file present but unparseable");
  const checks = [];
  for (const m of md.matchAll(/^\| ([^|]+?) \| (✅|🟡|🔴) \|/gm)) {
    const name = m[1].trim().replace(/fable/gi, "flagship");
    if (name === "check") continue;
    checks.push({ name, status: m[2] === "✅" ? "ok" : m[2] === "🟡" ? "warn" : "fail" });
  }
  return {
    label: "MEASURED",
    updated_at: head ? head[1].trim() : null,
    color: health[1],
    fail: Number(health[2]),
    warn: Number(health[3]),
    ok: Number(health[4]),
    checks,
    verify: "published artifact — counts and per-check states are emitted verbatim by the operating layer's heartbeat run",
  };
}

/* ── 2 · receipts (the third-party-verifiable proof rail) ───────────────── */
// Export the signed bundle via the stratos CLI (or take a pre-exported file),
// then verify it HERE with the same fail-closed chain+signature replay the
// browser runs. Publish ONLY if it verifies. The bundle embeds the node's
// PUBLIC key only — that is its entire design.
function exportBundle() {
  if (process.env.EFL_RECEIPTS_BUNDLE && existsSync(process.env.EFL_RECEIPTS_BUNDLE)) {
    return JSON.parse(readFileSync(process.env.EFL_RECEIPTS_BUNDLE, "utf8"));
  }
  const bin = process.env.EFL_STRATOS_BIN;
  if (!bin || !existsSync(bin)) return null;
  const out = execFileSync(process.execPath, [bin, "receipt", "export"], {
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  }).toString();
  return JSON.parse(out);
}

// FULL server-side verification before anything is published — the same
// fail-closed replay every visitor's browser runs (lib/verify-receipts.ts):
// hash chain + BOTH halves of the hybrid signature (Ed25519 via node:crypto,
// ML-DSA-65 via the same audited @noble suite the node itself uses). A bundle
// that does not fully verify here is NOT published. canonical() mirrors
// capability-receipt.js exactly.
function canonical(v) {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  return "{" + Object.keys(v).sort().map((k) => JSON.stringify(k) + ":" + canonical(v[k])).join(",") + "}";
}
const sha256hex = (s) => createHash("sha256").update(s).digest("hex");
const receiptBody = (r) => ({
  receipt_id: r.receipt_id, ts: r.ts, actor_id: r.actor_id, action: r.action,
  ref: r.ref, node_id: r.node_id, owner_wallet: r.owner_wallet ?? null,
  input_hash: r.input_hash, output_hash: r.output_hash, cost_units: r.cost_units,
  caller_id: r.caller_id ?? null, prev_hash: r.prev_hash,
});
function replayChain(bundle) {
  if (!bundle || !Array.isArray(bundle.receipts)) return { ok: false, reason: "malformed bundle" };
  if (!bundle.public_key?.ed25519Der || !bundle.public_key?.mldsaDer) {
    return { ok: false, reason: "no public key (fail-closed)" };
  }
  let edKey, mldsaPub;
  try {
    edKey = createPublicKey({ key: Buffer.from(bundle.public_key.ed25519Der, "base64"), format: "der", type: "spki" });
    mldsaPub = new Uint8Array(Buffer.from(bundle.public_key.mldsaDer, "base64"));
  } catch (e) {
    return { ok: false, reason: "unusable public key: " + e.message };
  }
  let prev = null;
  for (let i = 0; i < bundle.receipts.length; i++) {
    const r = bundle.receipts[i];
    if (!r || typeof r !== "object") return { ok: false, reason: `malformed receipt ${i}` };
    if (prev === null) prev = r.prev_hash;
    if (r.prev_hash !== prev) return { ok: false, reason: `broken chain link at ${i}` };
    const body = canonical(receiptBody(r));
    if (r.hash !== sha256hex(body)) return { ok: false, reason: `receipt ${i} tampered` };
    if (!r.sig || typeof r.sig.ed25519Sig !== "string" || typeof r.sig.mldsaSig !== "string") {
      return { ok: false, reason: `receipt ${i} missing hybrid signature` };
    }
    let edOk = false, pqOk = false;
    try { edOk = edVerify(null, Buffer.from(body), edKey, Buffer.from(r.sig.ed25519Sig, "base64")); } catch { edOk = false; }
    if (!edOk) return { ok: false, reason: `receipt ${i} Ed25519 signature failed` };
    try { pqOk = ml_dsa65.verify(new Uint8Array(Buffer.from(r.sig.mldsaSig, "base64")), new Uint8Array(Buffer.from(body)), mldsaPub); } catch { pqOk = false; }
    if (!pqOk) return { ok: false, reason: `receipt ${i} ML-DSA-65 signature failed` };
    prev = r.hash;
  }
  return { ok: true };
}

// The published bundle is REBUILT from an explicit field whitelist — an extra
// field added upstream (CLI version drift, a pre-exported file) can never ship
// silently. Only what the third-party verifier needs survives. Fail-closed on
// the OUTPUT schema too: a missing required field throws (caller publishes
// nothing), never a stringified "undefined".
const requireB64 = (v, name) => {
  if (typeof v !== "string" || !v || !/^[A-Za-z0-9+/=]+$/.test(v)) {
    throw new Error(`bundle public_key.${name} missing/invalid — refusing to publish`);
  }
  return v;
};
function whitelistBundle(bundle) {
  return {
    format: String(bundle.format),
    exported_at: Number(bundle.exported_at),
    ...(bundle.node_id ? { node_id: String(bundle.node_id) } : {}),
    public_key: {
      // all four are PUBLIC keys by construction; the CLI verifier requires
      // the full bundle shape (importPublicKeyBundle reads every entry).
      x25519Der: requireB64(bundle.public_key.x25519Der, "x25519Der"),
      ed25519Der: requireB64(bundle.public_key.ed25519Der, "ed25519Der"),
      mlkemDer: requireB64(bundle.public_key.mlkemDer, "mlkemDer"),
      mldsaDer: requireB64(bundle.public_key.mldsaDer, "mldsaDer"),
    },
    receipts: bundle.receipts.map((r) => ({
      ...receiptBody(r),
      hash: String(r.hash),
      sig: { ed25519Sig: String(r.sig.ed25519Sig), mldsaSig: String(r.sig.mldsaSig) },
    })),
  };
}

function readReceipts() {
  let bundle;
  try {
    bundle = exportBundle();
  } catch (e) {
    return { tile: notMeasured("receipt export failed: " + e.message.split("\n")[0]), bundle: null };
  }
  if (!bundle) return { tile: notMeasured("no receipt source configured on build machine"), bundle: null };
  const v = replayChain(bundle);
  if (!v.ok) return { tile: notMeasured("exported bundle did not verify (" + v.reason + ") — not published"), bundle: null };
  try {
    bundle = whitelistBundle(bundle);
  } catch (e) {
    return { tile: notMeasured(e.message), bundle: null };
  }
  return {
    tile: {
      label: "MEASURED",
      updated_at: bundle.exported_at ? new Date(bundle.exported_at).toISOString() : NOW,
      count: bundle.receipts.length,
      node_did: bundle.node_id || null,
      bundle_path: "/proof/receipts-bundle.json",
      verify: "npm i -g @efficientlabs/stratos && stratos receipt verify receipts-bundle.json — or let this page verify it in your browser",
    },
    bundle,
  };
}

/* ── 3 · routing distribution ───────────────────────────────────────────── */
// Counts the routing-telemetry log: rung histogram + flagship avoidance. The
// log is self-attested by the operating layer (counted units, not an
// independent audit) — said plainly on the tile.
function readRouting() {
  const raw = opsFile("routing-telemetry.jsonl");
  if (!raw) return notMeasured("routing telemetry not present on build machine");
  const rows = raw.trim().split("\n").flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });
  if (!rows.length) return notMeasured("routing telemetry empty");
  const rungs = {};
  let flagshipUsed = 0, flagshipAvoided = 0, flagshipOnDeterministic = 0, lastTs = null;
  for (const r of rows) {
    rungs[r.rung] = (rungs[r.rung] || 0) + 1;
    if (r.fable_avoided) flagshipAvoided += 1;
    if (typeof r.model === "string" && /fable/i.test(r.model)) {
      flagshipUsed += 1;
      if (r.kind === "deterministic") flagshipOnDeterministic += 1;
    }
    if (r.ts && (!lastTs || r.ts > lastTs)) lastTs = r.ts;
  }
  const total = rows.length;
  return {
    label: "MEASURED",
    updated_at: lastTs,
    total,
    rungs,
    rung1_pct: Math.round(((rungs[1] || 0) / total) * 1000) / 10,
    flagship_used: flagshipUsed,
    flagship_avoided: flagshipAvoided,
    flagship_on_deterministic: flagshipOnDeterministic,
    method: "self-attested routing log, script-counted — counted units, not an independent audit",
    verify: "published artifact — histogram recomputable from the counts shown",
  };
}

/* ── 4 · intelligence counters ──────────────────────────────────────────── */
// Parses the score snapshot's tables. Rows whose label is null in the source
// STAY null here — the gaps are the credibility.
function readIntelligence() {
  const md = opsFile("INTELLIGENCE_SCORE_SNAPSHOT.md");
  if (!md) return notMeasured("intelligence snapshot not present on build machine");
  const head = /^# INTELLIGENCE_SCORE_SNAPSHOT — (.+?)(?:\s+\(|$)/m.exec(md);
  const counters = {};
  for (const m of md.matchAll(/^\| ([a-z0-9_]+) \| ([^|]+) \| (MEASURED|ESTIMATED|null) \|/gm)) {
    const value = m[2].trim();
    counters[m[1]] = m[3] === "null"
      ? { value: null, label: null }
      : { value: /^\d+$/.test(value) ? Number(value) : value, label: m[3] };
  }
  if (!Object.keys(counters).length) return notMeasured("intelligence snapshot unparseable");
  return {
    label: "MEASURED",
    updated_at: head ? head[1].trim() : null,
    counters,
    verify: "published artifact — null rows are printed as null, never filled",
  };
}

/* ── 5 · token / cache economics ────────────────────────────────────────── */
// Weighted cache-hit across snapshot sessions: cache_read ÷ (input + cache_read
// + cache_create), summed over all rows — provider-reported fields only. NO
// dollar figures (pricing language is gated; cost is never computed from
// remembered pricing).
function readEconomics() {
  const md = opsFile("TOKEN_TELEMETRY_SNAPSHOT.md");
  if (!md) return notMeasured("token telemetry snapshot not present on build machine");
  const head = /^# TOKEN_TELEMETRY_SNAPSHOT — (\S+)/m.exec(md);
  let input = 0, cacheRead = 0, cacheCreate = 0, reqs = 0, sessions = 0;
  for (const m of md.matchAll(/^\| (\w+) \| ([\d,]+) \| ([\d,]+) \| ([\d,]+) \| ([\d,]+) \| ([\d,]+) \|/gm)) {
    const n = (s) => Number(s.replace(/,/g, ""));
    sessions += 1;
    reqs += n(m[2]);
    input += n(m[3]);
    cacheRead += n(m[5]);
    cacheCreate += n(m[6]);
  }
  const denom = input + cacheRead + cacheCreate;
  if (!sessions || !denom) return notMeasured("token telemetry table unparseable");
  return {
    label: "MEASURED",
    updated_at: head ? head[1].trim() : null,
    sessions,
    requests: reqs,
    weighted_cache_hit_pct: Math.round((cacheRead / denom) * 1000) / 10,
    method: "provider-reported usage fields; cache hit = cache_read ÷ (input + cache_read + cache_create) summed over all sessions",
    verify: "published artifact — recomputable from the method shown; no dollar figure is published anywhere",
  };
}

/* ── 6 · activation matrix (completion-check verdicts) ──────────────────── */
// Component verdicts straight from the completion check. PARTIAL components
// are published WITH their status — a matrix that is always green is an ad.
function readActivation() {
  const md = opsFile("COMPLETION_CHECK.md");
  if (!md) return notMeasured("completion check not present on build machine");
  const head = /^# COMPLETION_CHECK — (.+)$/m.exec(md);
  const components = [];
  for (const m of md.matchAll(/^## ([a-z0-9-]+) — \*\*(PASS|PARTIAL|FAIL)\*\* \((.+?)\)/gm)) {
    components.push({ name: m[1], verdict: m[2], status: m[3].replace(/ —.*$/, "").trim() });
  }
  if (!components.length) return notMeasured("completion check unparseable");
  return {
    label: "MEASURED",
    updated_at: head ? head[1].trim() : null,
    production: components.filter((c) => c.status === "PRODUCTION").length,
    total: components.length,
    components,
    verify: "published artifact — non-PRODUCTION components are listed with their honest state",
  };
}

/* ── anonymization gate (fail-closed, before any write) ─────────────────── */
// Scans the SERIALIZED artifacts for secret shapes + internal identifiers.
// Patterns mirror the org's pre-publish anonymization gate. Any hit = abort.
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
];
function anonymizationGate(name, text) {
  const hits = FORBIDDEN.flatMap(([re, why]) => {
    const m = re.exec(text);
    return m ? [`${name}: ${why} ("${m[0].slice(0, 24)}…")`] : [];
  });
  return hits;
}

/* ── main ───────────────────────────────────────────────────────────────── */
const { tile: receipts, bundle } = readReceipts();
const status = {
  format: "efl.public-status.v1",
  generated_at: NOW,
  render_rules: "MEASURED values render as numbers; ESTIMATED only with its label; null renders as 'not measured'. Staleness is shown, never hidden.",
  tiles: {
    heartbeat: readHeartbeat(),
    receipts,
    routing: readRouting(),
    intelligence: readIntelligence(),
    economics: readEconomics(),
    activation: readActivation(),
  },
};

const statusText = JSON.stringify(status, null, 2) + "\n";
const bundleText = bundle ? JSON.stringify(bundle, null, 2) + "\n" : null;

const violations = [
  ...anonymizationGate("public-status.json", statusText),
  ...(bundleText ? anonymizationGate("receipts-bundle.json", bundleText) : []),
];
if (violations.length) {
  console.error("build-public-status: ANONYMIZATION GATE FAILED — nothing written:");
  for (const v of violations) console.error("  - " + v);
  process.exit(1);
}

const measured = Object.entries(status.tiles).filter(([, t]) => t.label === "MEASURED").map(([k]) => k);
const nulls = Object.entries(status.tiles).filter(([, t]) => t.label === null).map(([k]) => k);
console.log(`build-public-status: ${measured.length} MEASURED tile(s) [${measured.join(", ")}]` +
  (nulls.length ? ` · ${nulls.length} not-measured [${nulls.join(", ")}]` : ""));

if (CHECK) {
  console.log(statusText);
  process.exit(0);
}
writeFileSync(OUT_STATUS, statusText);
if (bundleText) {
  mkdirSync(dirname(OUT_BUNDLE), { recursive: true });
  writeFileSync(OUT_BUNDLE, bundleText);
}
console.log(`wrote data/public-status.json${bundleText ? " + public/proof/receipts-bundle.json" : " (no receipt bundle published)"}`);
