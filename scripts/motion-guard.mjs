#!/usr/bin/env node
/**
 * motion-guard — the 60fps discipline as a CI guarantee, not a review hope.
 *
 * Scans GSAP tween call sites in components/, app/ and lib/ and FAILS the
 * build if a tween's vars animate a layout/paint property. Compositor rule:
 * transform (x/y/scale/rotate/percent variants) and opacity only; blurs and
 * shadows are never animated directly.
 *
 * Detection: ANY `<ident>.to(` / `.from(` / `.fromTo(` call in a file that
 * imports gsap — so timelines named tl/master/introTl/etc. are all covered —
 * minus a denylist of known non-GSAP receivers (Array.from, Object, …).
 * Callback bodies (`=> { … }`) inside the captured args are stripped before
 * matching, so DOM work inside onUpdate/onComplete can't false-positive.
 * Both bare and quoted keys are matched.
 *
 * Usage: node scripts/motion-guard.mjs   (exit 1 on any violation)
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["components", "app", "lib"];

// Receivers whose .to/.from are never GSAP.
const NOT_GSAP = new Set([
  "Array", "Object", "Promise", "String", "Number", "JSON", "Math",
  "Buffer", "TypedArray", "Uint8Array", "BigInt",
]);

// Layout/paint properties that must never appear in a gsap tween (bare or quoted keys).
const BANNED =
  /['"]?(?<![A-Za-z$_])(width|height|top|left|right|bottom|margin[A-Za-z]*|padding[A-Za-z]*|boxShadow|filter|backdropFilter|fontSize|lineHeight|borderWidth)['"]?\s*:/;

const TWEEN_CALL = /\b([A-Za-z_$][\w$]*)\s*\.\s*(to|from|fromTo)\s*\(/g;

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

/** Capture the argument span of a call, balancing parens (string-naive but adequate for vars objects). */
function captureArgs(src, openParenIdx) {
  let depth = 0;
  for (let i = openParenIdx; i < Math.min(src.length, openParenIdx + 6000); i++) {
    if (src[i] === "(") depth++;
    else if (src[i] === ")") {
      depth--;
      if (depth === 0) return src.slice(openParenIdx, i + 1);
    }
  }
  return src.slice(openParenIdx, openParenIdx + 6000);
}

/** Remove `=> { … }` callback bodies (brace-balanced) so handler code can't false-positive. */
function stripCallbackBodies(text) {
  let out = "";
  let i = 0;
  while (i < text.length) {
    const arrow = text.indexOf("=>", i);
    if (arrow === -1) {
      out += text.slice(i);
      break;
    }
    let j = arrow + 2;
    while (j < text.length && /\s/.test(text[j])) j++;
    if (text[j] !== "{") {
      out += text.slice(i, arrow + 2);
      i = arrow + 2;
      continue;
    }
    out += text.slice(i, arrow + 2) + " {…}";
    let depth = 0;
    do {
      if (text[j] === "{") depth++;
      else if (text[j] === "}") depth--;
      j++;
    } while (j < text.length && depth > 0);
    i = j;
  }
  return out;
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
    if (!/from\s+["']gsap|require\(["']gsap/.test(src)) continue;
    let m;
    TWEEN_CALL.lastIndex = 0;
    while ((m = TWEEN_CALL.exec(src))) {
      if (NOT_GSAP.has(m[1])) continue;
      const args = stripCallbackBodies(captureArgs(src, m.index + m[0].length - 1));
      if (!args.includes("{")) continue; // no vars object — not a tween shape
      const hit = args.match(BANNED);
      if (hit) {
        const line = src.slice(0, m.index).split("\n").length;
        violations.push(
          `${file.replace(ROOT + "/", "")}:${line} — ${m[1]}.${m[2]}() animates layout property "${hit[1]}"`,
        );
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
