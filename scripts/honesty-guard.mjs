#!/usr/bin/env node
/**
 * honesty-guard — the CI tripwire for the honesty moat.
 * ============================================================================
 *
 * WHY THIS EXISTS
 * ---------------
 * The public L0–L5 status matrix (data/status.json, rendered by StatusMatrix)
 * labels every capability Live / Wired / Config needed / Standalone / Mock. That honesty IS the
 * brand. A single line of marketing copy that says a Mock capability is "live"
 * or "shipping" detonates the whole moat. This script makes that tamper-evident:
 * it fails the build (exit 1) if marketing copy claims a not-yet-Live capability
 * is already live/available/in-production.
 *
 * DESIGN — rules-based, deterministic, false-positives near zero
 * --------------------------------------------------------------
 * The status names in data/status.json ("Speech & vision (STT/TTS)", "Economic
 * / on-chain settlement", …) are NOT the words marketing uses ("senses", "eyes
 * and ears", "settlement"). A literal name match would catch nothing. So instead:
 *
 *   1. From data/status.json we take the SOURCE OF TRUTH: every capability and
 *      its real level. We only police capabilities whose level is NOT "live"
 *      (i.e. wired / config-needed / standalone / mock) — Live caps may be described as live.
 *
 *   2. CONCEPT MAP (curated, below): each policed capability is given a small set
 *      of "subject" regexes — the words marketing actually uses for it. These are
 *      derived from the capability name/detail where possible and hand-tuned for
 *      the thematic copy. Keep this map in sync when you add a capability.
 *
 *   3. LIVE-CLASS VERBS: a small closed set of phrases that assert present-tense
 *      production reality ("live", "in production", "available now", "shipping",
 *      "running in production", "ships today", "generally available", "GA").
 *
 *   4. A VIOLATION = a policed capability's subject within PROXIMITY chars of a
 *      live-class verb, in a scanned marketing surface. Proximity (not whole-file)
 *      keeps false-positives down: "speech is coming" near a *different* para that
 *      says "five channels are live" must NOT trip.
 *
 * CONSERVATISM
 * ------------
 * We deliberately err toward MISSING a borderline case rather than false-flagging
 * legitimate copy. The verb list is closed and present-tense only; aspirational
 * wording ("will", "soon", "roadmap", "coming") is never a verb. The matrix's own
 * honest labels (e.g. the word "Mock"/"Standalone" rendered as a badge) and the
 * status.json/status.ts files themselves are excluded from scanning.
 *
 * EXTENDING
 * ---------
 *   - New capability goes not-Live → add a CONCEPT entry keyed by its exact name.
 *   - New marketing surface → add it to SURFACES.
 *   - A verb is too aggressive → tighten LIVE_VERBS (prefer fewer, high-signal).
 *
 * USAGE
 *   node scripts/honesty-guard.mjs            # scan real surfaces, exit 1 on any violation
 *   node scripts/honesty-guard.mjs --self-test # run built-in fixtures (clean passes, overclaim caught)
 * ============================================================================
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STATUS_PATH = join(ROOT, "data/status.json");

// ── how close a subject and a live-verb must be (chars) to count as a claim ──
const PROXIMITY = 90;

// ── live-class verbs: present-tense assertions of production reality only ──
// Closed set. Aspirational/future wording is intentionally absent.
const LIVE_VERBS = [
  /\blive\b/i,
  /\bin production\b/i,
  /\brunning in production\b/i,
  /\bavailable now\b/i,
  /\bgenerally available\b/i,
  /\bnow available\b/i,
  /\bshipping\b/i,
  /\bships today\b/i,
  /\bshipped\b/i,
  /\bin prod\b/i,
  /\bproduction[- ]ready\b/i,
];

/**
 * CONCEPT MAP — capability name (must match data/status.json exactly) → subject
 * regexes (the words marketing uses for it). Only capabilities present here are
 * policed for proximity-to-verb; we generate this list and assert below that
 * EVERY non-Live capability is either covered here or explicitly acknowledged as
 * "no marketing surface" so the map can never silently drift out of sync.
 */
const CONCEPT = {
  // ── Mock (highest risk — explicitly NOT real) ──
  "Speech & vision (STT/TTS)": [
    /\bspeech\b/i, /\bvoice\b/i, /\bvision\b/i, /\bSTT\b/, /\bTTS\b/,
    /\beyes,?\s+ears\b/i, /\bsenses\b/i, /\bsensing\b/i, /\baudio\b/i,
  ],
  "Economic / on-chain settlement": [
    /\bsettlement\b/i, /\bon-?chain\b/i, /\bpayments?\b/i, /\bmicro-?payments?\b/i,
  ],
  "ACP agent-to-agent proxy": [
    /\bACP\b/, /\bagent-to-agent\b/i, /\bagent2agent\b/i,
  ],
  // ── Standalone (built in isolation; live wiring supervised) ──
  "Broker → live gateway path": [
    /\blive gateway\b/i, /\bgateway path\b/i,
  ],
  // ── Wired (built + connected; hardening in progress) ──
  "Hyperswarm DHT + hole-punch": [
    /\bhole-?punch\w*\b/i, /\bhyperswarm\b/i,
  ],
  "Gossip skill-sync": [
    /\bgossip\b/i, /\bskill-?sync\b/i,
  ],
  "Skill-seal verification on ingest": [
    /\bskill-?seal\b/i, /\bseal verification\b/i,
  ],
  "Broker env-scoping": [
    /\bbroker\b/i, /\benv-?scop\w*\b/i,
  ],
  "Exec + WASI sandbox": [
    /\bWASI\b/, /\bexec sandbox\b/i,
  ],
  "Write-approval (402 loop)": [
    /\b402\b/, /\bwrite-?approval\b/i, /\bcost-?approval\b/i,
  ],
  "Browser/exec RCE removed": [
    /\bRCE\b/, /\bremote-?code\b/i,
  ],
  "Broker → local gateway path": [
    /\blocal gateway\b/i, /\bgateway path\b/i, /\bATMOS_GATEWAY_SECRET\b/,
  ],
  "Channel adapters": [
    /\bchannel adapters?\b/i,
  ],
  "Public Stratos routing honesty": [
    /\bStratos routing\b/i, /\bmodel routing\b/i, /\bmodel adapter\b/i,
  ],
};

// ── marketing surfaces to scan (relative to ROOT). Status source files are
//    excluded by construction (they ARE the truth, not a claim). ──
const SURFACES = [
  "README.md",
  "data/updates.json",
  "app/layout.tsx",
  "app/page.tsx",
  "app/pricing/page.tsx",
  "app/updates/page.tsx",
  "components/StratosAgent.tsx",
  // landing Proof strip (added 2026-06-11 with the operating-layer proof
  // section). It carries thesis copy + measured numbers from
  // data/public-status.json, so it is policed like any marketing surface.
  // EXCLUDED: components/proof/* — they render the public-status artifact's
  // honest labels (MEASURED / not measured / lifecycle states) verbatim and
  // would self-trip, exactly like the other truth renderers noted below.
  "components/ProofStrip.tsx",
  // Cinematic glass landing sections (2026-06-14) — each carries marketing copy
  // (stakes/answer/proof-lede/how-it-works/readiness/final-CTA) and is policed
  // like any landing surface. The glass kit (components/glass/*) is presentational
  // (no claims) so it is not scanned.
  "components/landing/Stakes.tsx",
  "components/landing/Answer.tsx",
  "components/landing/ProofLede.tsx",
  "components/landing/HowItWorks.tsx",
  "components/landing/ReadinessLadder.tsx",
  "components/landing/FinalCTA.tsx",
  "components/Solutions.tsx",
  "components/Differentiators.tsx",
  "components/Install.tsx",
  "components/Pricing.tsx",
  "components/SovereignPath.tsx",
  "components/Footer.tsx",
  "components/acts/AtmosphereReveal.tsx",
  "components/acts/ContentAddress.tsx",
  "components/acts/HolePunch.tsx",
  "components/acts/Capability.tsx",
  "components/acts/SkillSeal.tsx",
  // standalone route pages + extracted sections (added 2026-06-06 with nav→pages)
  "components/Architecture.tsx",
  "app/atmosphere/page.tsx",
  "app/stratos/page.tsx",
  "app/architecture/page.tsx",
  "app/install/page.tsx",
  // Runtime Score lead-magnet page (2026-06-13). The board component
  // (components/score/*) is a truth renderer like components/proof/* and is
  // excluded for the same self-trip reason; the PAGE carries marketing copy.
  "app/score/page.tsx",
  // Onboarding journey (2026-06-13): page + checklist/segmentation component
  // both carry copy; lib/onboarding.ts carries the checklist + teach-lines;
  // signup carries the sovereign-path escape line.
  "app/start/page.tsx",
  "components/onboarding/StartJourney.tsx",
  "lib/onboarding.ts",
  "app/signup/page.tsx",
  // DropBundleVerify carries CLAIM copy ("never leaves this page", step-5 promise)
  // alongside its truth-rendering — the copy half is policed (2026-06-13).
  "components/proof/DropBundleVerify.tsx",
  // shared sub-page building blocks that carry marketing copy (added 2026-06-06
  // with the full nav→sub-page wiring). The route pages above pass copy as props
  // to these; we also scan the components themselves for any inline claim text.
  // EXCLUDED: components/pages/StatusBadge.tsx + components/pages/StatusLegend.tsx
  // — they RENDER the honest Live/Wired/Standalone/Mock labels (sourced from
  // status.json via lib/status) and would self-trip, exactly like StatusMatrix.
  "components/pages/SubPageHero.tsx",
  "components/pages/SubPageCTA.tsx",
  "components/pages/DeepSection.tsx",
  "components/pages/DeepCard.tsx",
  "components/pages/StepFlow.tsx",
  "components/pages/InstallTerminal.tsx",
  // NOTE: app/status/page.tsx and components/status/* (ActivityHeadline,
  // LaunchProgress, ActivityFeed, activity.ts) are intentionally NOT scanned —
  // they render the status matrix / status-derived progress + the generated
  // activity feed, not free-form marketing claims, and would self-trip on the
  // honest status labels. data/activity.json is generated data, never a claim.
  // docs surface — the largest body of claims, now policed
  "app/docs/page.tsx",
  "app/docs/[slug]/page.tsx",
  "data/docs.ts",
  "components/docs/ArticleBody.tsx",
  // Atmosphere OS surface (/app) — the customer control plane. Every module page
  // and the OS chrome carries copy describing capabilities, so it is policed too
  // (added 2026-06-06 with the OS integration / nav→/app reachability).
  "app/app/page.tsx",
  "app/app/agents/page.tsx",
  "app/app/workflows/page.tsx",
  "app/app/projects/page.tsx",
  "app/app/skills/page.tsx",
  "app/app/integrations/page.tsx",
  "app/app/memory/page.tsx",
  "app/app/atmosphere/page.tsx",
  "app/app/wallet/page.tsx",
  "app/app/rewards/page.tsx",
  "app/app/settings/page.tsx",
  // OS components that carry copy but do NOT render status labels.
  "components/os/ConnectRow.tsx",
  "components/os/EmptyState.tsx",
  "components/os/OsMobileDrawer.tsx",
  "components/os/OsShell.tsx",
  "components/os/OsSidebar.tsx",
  "components/os/OsTopBar.tsx",
  "components/os/StatPill.tsx",
  "components/os/modules.ts",
  "components/os/useOsSession.ts",
  // OS customization surface (added 2026-06-07 with the Customize hub / Advanced
  // mode). CustomizePanel carries the copy describing what Advanced mode reveals
  // (agent config, mesh detail, skill management, model routing); useOsPrefs holds
  // the canonical Dashboard-section labels/descriptions ("what is actually live
  // now", …). Neither RENDERS Live/Wired/Standalone/Mock status labels, so they
  // are policed for overclaims. EXCLUDED: components/os/AdvancedControls.tsx — it
  // wraps StatusChip to print the honest status label (via capLevel from
  // status.json) for each control row and would self-trip, exactly like the other
  // OS status-label renderers (StatusChip / OsCard / ComingSoon / ModuleHeader).
  "components/os/CustomizePanel.tsx",
  "components/os/useOsPrefs.ts",
  // NOTE: components/status/CompletedCapabilities.tsx is intentionally NOT scanned
  // — like ActivityFeed / LaunchProgress / StatusMatrix it is a status-DERIVED
  // renderer (it reads data/status.json via lib/status and prints the honest
  // Live/Wired badge labels, including the phrase "running in production" beside a
  // Live badge) and would self-trip. It is a renderer of the truth, not a claim.
  // NOTE: components/acts/StatusMatrix.tsx, app/status/page.tsx, and
  // components/docs/StatusBadge.tsx are intentionally NOT scanned — they
  // RENDER the honest labels (the literal words Live/Wired/Mock) sourced from
  // status.json and would self-trip. They are the truth's renderers, not claims.
  // For the same reason the OS status-label renderers are excluded:
  // components/os/StatusChip.tsx, components/os/OsCard.tsx,
  // components/os/ComingSoon.tsx, components/os/ModuleHeader.tsx — each wraps
  // StatusBadge to print Live/Wired/Standalone/Mock and would self-trip.
];

const LEVEL_LABEL = { wired: "Wired", config: "Config needed", standalone: "Standalone", mock: "Mock" };

// Sentence/clause boundary characters. Used to clamp the proximity window so a
// live-verb in a DIFFERENT sentence can't pair with a subject in this one.
const BOUNDARY = /[.;!?\n]/;
/**
 * Walk from `from` toward `bound` (dir -1 = left, +1 = right) and stop at the
 * first sentence boundary, returning the clamped index. `anchor` is the subject
 * edge so we never clamp past it.
 */
function clampToSentence(text, bound, anchor, dir) {
  if (dir < 0) {
    for (let i = anchor - 1; i >= bound; i--) if (BOUNDARY.test(text[i])) return i + 1;
    return bound;
  }
  for (let i = anchor; i < bound; i++) if (BOUNDARY.test(text[i])) return i;
  return bound;
}

function loadPolicedCaps(statusPath) {
  const data = JSON.parse(readFileSync(statusPath, "utf8"));
  const policed = []; // { name, level }
  for (const layer of data.layers) {
    for (const cap of layer.caps) {
      if (cap.level !== "live") policed.push({ name: cap.name, level: cap.level });
    }
  }
  return policed;
}

/** Scan one text blob; return [{ line, col, capability, level, verb, snippet }]. */
function scanText(text, policedByName) {
  const violations = [];
  // precompute line offsets for line:col reporting
  const lineStarts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") lineStarts.push(i + 1);
  const posToLineCol = (idx) => {
    let lo = 0, hi = lineStarts.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (lineStarts[mid] <= idx) lo = mid; else hi = mid - 1; }
    return { line: lo + 1, col: idx - lineStarts[lo] + 1 };
  };

  for (const { name, level } of policedByName) {
    const subjects = CONCEPT[name];
    if (!subjects) continue; // not in concept map → not policed (asserted elsewhere)
    for (const subj of subjects) {
      const re = new RegExp(subj.source, subj.flags.includes("g") ? subj.flags : subj.flags + "g");
      let m;
      while ((m = re.exec(text)) !== null) {
        const sIdx = m.index, sEnd = sIdx + m[0].length;
        // Proximity window, but clamped to the SAME sentence/clause: a verb in a
        // different sentence ("…are live. Speech is mock") must not pair with this
        // subject. Sentence boundaries: . ; ! ? newline. This is the single biggest
        // false-positive reducer in real prose.
        const winStart = clampToSentence(text, Math.max(0, sIdx - PROXIMITY), sIdx, -1);
        const winEnd = clampToSentence(text, Math.min(text.length, sEnd + PROXIMITY), sEnd, +1);
        const window = text.slice(winStart, winEnd);
        for (const verb of LIVE_VERBS) {
          const vm = verb.exec(window);
          if (vm) {
            // Carve-out: "Live:" used as a LABEL prefix (e.g. an aria-label or a
            // demo caption "Live: …") is the "live animation/demo" sense, not a
            // production-status claim. Narrow + auditable: only when the matched
            // verb is exactly "live" and the very next non-space char is a colon.
            const after = window.slice(vm.index + vm[0].length).replace(/^\s+/, "");
            if (/^live$/i.test(vm[0]) && after.startsWith(":")) continue;
            const { line, col } = posToLineCol(sIdx);
            violations.push({
              line, col, capability: name, level,
              subject: m[0], verb: vm[0],
              snippet: window.replace(/\s+/g, " ").trim(),
            });
            break; // one violation per subject hit is enough
          }
        }
        if (re.lastIndex === m.index) re.lastIndex++; // guard zero-width
      }
    }
  }
  return violations;
}

function run(surfaces, statusPath) {
  const policed = loadPolicedCaps(statusPath);

  // Sync guard: every non-Live capability must be acknowledged in CONCEPT, so the
  // rule set provably tracks the source of truth. (All current non-Live caps have
  // a concept entry; if a new one is added without one, this fails loudly.)
  const uncovered = policed.filter((c) => !CONCEPT[c.name]);
  if (uncovered.length) {
    console.error("honesty-guard: status.json has non-Live capabilities with no CONCEPT rule:");
    for (const c of uncovered) console.error(`  - "${c.name}" (${c.level})`);
    console.error("Add a CONCEPT entry (or an empty [] with a comment if it has no marketing surface).");
    return { violations: [], configError: true };
  }

  const violations = [];
  for (const rel of surfaces) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) continue;
    const text = readFileSync(abs, "utf8");
    for (const v of scanText(text, policed)) violations.push({ file: rel, ...v });
  }
  return { violations, configError: false };
}

// ── self-test: proves clean passes + an injected overclaim is caught ──
function selfTest() {
  const policed = loadPolicedCaps(STATUS_PATH);
  let pass = true;

  // (a) legitimate copy MUST NOT trip — aspirational + cross-paragraph cases
  const clean = [
    "Speech and vision are on the roadmap; STT/TTS will arrive soon.",
    "Eyes, ears, and a voice — processed on your own machine.", // no live-verb nearby
    "Channel adapters are configured per host; speech & vision are still mock.", // config-level capability with a non-live verb must not trip
    "On-chain settlement is offline-signed and never broadcast — coming later.",
  ];
  for (const t of clean) {
    const v = scanText(t, policed);
    if (v.length) { pass = false; console.error("SELF-TEST FAIL (false positive):", t, "→", v); }
  }

  // (b) an injected overclaim MUST be caught (one per non-Live level)
  const dirty = [
    "Our speech and vision senses are live and running in production today.",     // mock
    "On-chain settlement is available now for every node.",                        // mock
    "The broker → live gateway path is shipping in production.",                   // standalone
    "Hyperswarm hole-punching is live and generally available.",                   // wired
  ];
  for (const t of dirty) {
    const v = scanText(t, policed);
    if (!v.length) { pass = false; console.error("SELF-TEST FAIL (missed overclaim):", t); }
    else console.log(`  caught: "${t}" → ${v[0].capability} [${v[0].level}] (verb: ${v[0].verb})`);
  }

  console.log(pass ? "\nself-test: PASS" : "\nself-test: FAIL");
  return pass;
}

// ── main ──
const isSelfTest = process.argv.includes("--self-test");
if (isSelfTest) {
  process.exit(selfTest() ? 0 : 1);
}

const { violations, configError } = run(SURFACES, STATUS_PATH);
if (configError) {
  console.error("\nhonesty-guard: CONFIG ERROR — fix the rule set above. Failing build.");
  process.exit(2);
}

if (violations.length === 0) {
  console.log(`honesty-guard: clean — no overclaims across ${SURFACES.length} marketing surfaces.`);
  process.exit(0);
}

console.error(`\nhonesty-guard: ${violations.length} OVERCLAIM(S) — the status matrix says these are NOT Live:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}:${v.col}`);
  console.error(`    capability "${v.capability}" is ${LEVEL_LABEL[v.level] || v.level}, but copy pairs "${v.subject}" with live-claim "${v.verb}"`);
  console.error(`    …${v.snippet}…\n`);
}
console.error("Fix the copy or ship the capability to Live (scripts/ship.mjs). Failing build.");
process.exit(1);
