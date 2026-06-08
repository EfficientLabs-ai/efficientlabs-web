"use client";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { LAYERS, type Level } from "@/lib/status";

/**
 * Launch progress — an HONEST production-readiness number, derived entirely from
 * the capability matrix in data/status.json. There is NO hardcoded percentage.
 *
 * METHODOLOGY (auditable on the page itself)
 * ------------------------------------------
 * Every capability the matrix tracks contributes to the denominator. Each tier
 * earns partial credit toward "live in production", reflecting how close it
 * actually is to being real for a user:
 *
 *   Live       → 1.00  running in production, exercised by tests
 *   Wired      → 0.50  built + connected, still hardening
 *   Config     → 0.25  real code exists, owner config / external verification missing
 *   Standalone → 0.25  proven in isolation, live wiring supervised
 *   Mock       → 0.00  scaffold / placeholder — explicitly not real
 *
 * The percentage is round(Σ weight ÷ count). Because it is computed from the
 * same enum the matrix renders, the bar can never claim more than the matrix
 * admits — and if a capability slips from "live" to "wired", the number drops
 * automatically on the next build. No fabrication, in either direction.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

// Per-tier weight toward "live in production". Standalone earns a quarter: the
// capability is proven but its production wiring is still supervised, so it is
// honestly partway — not zero, not half.
const WEIGHTS: Record<Level, number> = {
  live: 1,
  wired: 0.5,
  config: 0.25,
  standalone: 0.25,
  mock: 0,
};

const ALL = LAYERS.flatMap((l) => l.caps);
const TOTAL = ALL.length;

const COUNTS: Record<Level, number> = {
  live: ALL.filter((c) => c.level === "live").length,
  wired: ALL.filter((c) => c.level === "wired").length,
  config: ALL.filter((c) => c.level === "config").length,
  standalone: ALL.filter((c) => c.level === "standalone").length,
  mock: ALL.filter((c) => c.level === "mock").length,
};

// Weighted readiness — the single honest number, computed not hardcoded.
const WEIGHTED =
  COUNTS.live * WEIGHTS.live +
  COUNTS.wired * WEIGHTS.wired +
  COUNTS.config * WEIGHTS.config +
  COUNTS.standalone * WEIGHTS.standalone +
  COUNTS.mock * WEIGHTS.mock;
const PCT = TOTAL > 0 ? Math.round((WEIGHTED / TOTAL) * 100) : 0;

// Each tier's share of the bar width, so the stacked track mirrors the math.
const PCT_BY: Record<Level, number> = {
  live: TOTAL > 0 ? (COUNTS.live * WEIGHTS.live) / TOTAL * 100 : 0,
  wired: TOTAL > 0 ? (COUNTS.wired * WEIGHTS.wired) / TOTAL * 100 : 0,
  config: TOTAL > 0 ? (COUNTS.config * WEIGHTS.config) / TOTAL * 100 : 0,
  standalone: TOTAL > 0 ? (COUNTS.standalone * WEIGHTS.standalone) / TOTAL * 100 : 0,
  mock: 0,
};

// Cumulative left-offsets for the stacked segments.
const OFFSET_WIRED = PCT_BY.live;
const OFFSET_STANDALONE = PCT_BY.live + PCT_BY.wired;
const OFFSET_CONFIG = PCT_BY.live + PCT_BY.wired + PCT_BY.standalone;

type TierVisual = { level: Level; label: string; color: string; weightLabel: string };

const TIERS: TierVisual[] = [
  { level: "live", label: "Live", color: "var(--color-signal)", weightLabel: "×1.0" },
  { level: "wired", label: "Wired", color: "#86c5ff", weightLabel: "×0.5" },
  { level: "config", label: "Config", color: "#ff9f6e", weightLabel: "×0.25" },
  { level: "standalone", label: "Standalone", color: "#c9a24b", weightLabel: "×0.25" },
  { level: "mock", label: "Mock", color: "#5b6675", weightLabel: "×0" },
];

export default function LaunchProgress() {
  const reduced = useReducedMotion();
  const weightedLabel = Number.isInteger(WEIGHTED) ? WEIGHTED : WEIGHTED.toFixed(2);

  return (
    <Reveal>
      <div className="lm-card p-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Toward launch</p>
            <h3 className="display mt-2 text-[1.25rem] text-[color:var(--color-ink)]">
              Production readiness
            </h3>
          </div>
          <div className="text-right">
            <span className="display text-[2rem] leading-none text-[color:var(--color-signal)]">
              {PCT}%
            </span>
            <p className="mono mt-1 text-[11px] text-[color:var(--color-ink-faint)]">
              {COUNTS.live}/{TOTAL} live · {COUNTS.wired} wired · {COUNTS.config} config-needed
            </p>
          </div>
        </div>

        {/* Stacked track: one segment per partially-credited tier, widths exactly
            equal to each tier's weighted contribution. The bar literally is the
            arithmetic — nothing is decorative. */}
        <div className="relative mt-5 h-3 w-full overflow-hidden rounded-full bg-[color:rgba(255,255,255,0.05)]">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "var(--color-signal)" }}
            initial={reduced ? false : { width: 0 }}
            whileInView={reduced ? undefined : { width: `${PCT_BY.live}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          />
          <motion.div
            className="absolute inset-y-0 rounded-full opacity-70"
            style={{ left: `${OFFSET_WIRED}%`, background: "#86c5ff" }}
            initial={reduced ? false : { width: 0 }}
            whileInView={reduced ? undefined : { width: `${PCT_BY.wired}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.3 }}
          />
          <motion.div
            className="absolute inset-y-0 rounded-full opacity-70"
            style={{ left: `${OFFSET_STANDALONE}%`, background: "#c9a24b" }}
            initial={reduced ? false : { width: 0 }}
            whileInView={reduced ? undefined : { width: `${PCT_BY.standalone}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
          />
          <motion.div
            className="absolute inset-y-0 rounded-full opacity-70"
            style={{ left: `${OFFSET_CONFIG}%`, background: "#ff9f6e" }}
            initial={reduced ? false : { width: 0 }}
            whileInView={reduced ? undefined : { width: `${PCT_BY.config}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.6 }}
          />
        </div>

        {/* Per-tier breakdown — the full arithmetic, on the page, no magic. */}
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2.5 sm:grid-cols-4">
          {TIERS.map((t) => (
            <div key={t.level} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: t.color }}
              />
              <span className="mono text-[11px] text-[color:var(--color-ink-dim)]">
                {COUNTS[t.level]} {t.label}
                <span className="ml-1 text-[color:var(--color-ink-faint)]">{t.weightLabel}</span>
              </span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
          Computed from the matrix below, not hand-set: each capability is weighted
          by tier — Live 1.0, Wired 0.5, Config-needed 0.25, Standalone 0.25, Mock
          0 — and the score is the weighted sum over all {TOTAL} capabilities
          ({weightedLabel} ÷ {TOTAL}). If a capability changes tier, this number
          moves on the next build. It can never claim more than the matrix admits.
        </p>
      </div>
    </Reveal>
  );
}
