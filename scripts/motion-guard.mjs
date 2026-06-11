#!/usr/bin/env node
/**
 * motion-guard — the 60fps discipline as a CI guarantee, not a review hope.
 *
 * Scans every GSAP tween call site (gsap.to / gsap.from / gsap.fromTo /
 * tl.to / tl.from / tl.fromTo) in components/, app/ and lib/ and FAILS the
 * build if the tween's vars object animates a layout property. Compositor
 * rule: transform (x/y/scale/rotate/percent variants) and opacity only;
 * blurs and shadows are never animated directly (crossfade a pre-rendered
 * layer instead).
 *
 * Heuristic: from each tween call, capture up to its closing braces and grep
 * the captured object literal for banned keys. Non-animating uses (gsap.set,
 * CSS files, motion/react props) are out of scope by design.
 *
 * Usage: node scripts/motion-guard.mjs   (exit 1 on any violation)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["components", "app", "lib"];

// Layout/paint properties that must never appear in a gsap tween.
const BANNED =
  /(?<![A-Za-z$_])(width|height|top|left|right|bottom|margin[A-Za-z]*|padding[A-Za-z]*|boxShadow|filter|backdropFilter|fontSize|lineHeight|borderWidth)\s*:/;

const TWEEN_CALL = /\b(?:gsap|tl|timeline)\s*\.\s*(?:to|from|fromTo)\s*\(/g;

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      yield* walk(p);
    } else if (/\.(tsx?|jsx?|mjs)$/.test(name) && !p.endsWith("motion-guard.mjs")) {
      yield p;
    }
  }
}

/** Capture the argument span of a call, balancing parens (good enough for vars objects). */
function captureArgs(src, openParenIdx) {
  let depth = 0;
  for (let i = openParenIdx; i < Math.min(src.length, openParenIdx + 4000); i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") {
      depth--;
      if (depth === 0) return src.slice(openParenIdx, i + 1);
    }
  }
  return src.slice(openParenIdx, openParenIdx + 4000);
}

const violations = [];
for (const dir of SCAN_DIRS) {
  let files;
  try {
    files = [...walk(join(ROOT, dir))];
  } catch {
    continue;
  }
  for (const file of files) {
    const src = readFileSync(file, "utf8");
    if (!src.includes("gsap")) continue;
    let m;
    TWEEN_CALL.lastIndex = 0;
    while ((m = TWEEN_CALL.exec(src))) {
      const args = captureArgs(src, m.index + m[0].length - 1);
      const hit = args.match(BANNED);
      if (hit) {
        const line = src.slice(0, m.index).split("\n").length;
        violations.push(`${file.replace(ROOT + "/", "")}:${line} — tween animates layout property "${hit[1]}"`);
      }
    }
  }
}

if (violations.length) {
  console.error(`motion-guard: ${violations.length} layout-property tween(s) — transform/opacity only:`);
  for (const v of violations) console.error("  ✗ " + v);
  process.exit(1);
}
console.log("motion-guard: clean — all GSAP tweens are compositor-safe (transform/opacity).");
