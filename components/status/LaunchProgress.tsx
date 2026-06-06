"use client";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { LAYERS } from "@/lib/status";

/**
 * Launch progress — an HONEST progress bar toward "everything Live".
 *
 * The denominator is every capability the status matrix tracks. The numerator
 * is what is actually running: Live capabilities count as fully done (1.0),
 * Wired as partial (0.5, since they're built + connected but still hardening).
 * Standalone/Mock count as 0 toward "live in production". This is derived purely
 * from data/status.json (via lib/status) — the same source the matrix renders,
 * so the bar can never claim more than the matrix admits.
 *
 * We label the methodology inline so the number is auditable, not magic.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const ALL = LAYERS.flatMap((l) => l.caps);
const TOTAL = ALL.length;
const LIVE = ALL.filter((c) => c.level === "live").length;
const WIRED = ALL.filter((c) => c.level === "wired").length;

// Weighted "in production" progress: live = 1, wired = 0.5, rest = 0.
const WEIGHTED = LIVE * 1 + WIRED * 0.5;
const PCT = TOTAL > 0 ? Math.round((WEIGHTED / TOTAL) * 100) : 0;
const LIVE_PCT = TOTAL > 0 ? Math.round((LIVE / TOTAL) * 100) : 0;

export default function LaunchProgress() {
  const reduced = useReducedMotion();

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
              {LIVE}/{TOTAL} live · {WIRED} wired
            </p>
          </div>
        </div>

        {/* track: a base "live" fill + a lighter "wired" extension, honest about
            the two-tier weighting. */}
        <div className="relative mt-5 h-3 w-full overflow-hidden rounded-full bg-[color:rgba(255,255,255,0.05)]">
          {/* live portion (solid signal) */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ background: "var(--color-signal)" }}
            initial={reduced ? false : { width: 0 }}
            whileInView={reduced ? undefined : { width: `${LIVE_PCT}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          />
          {/* wired half-weight extension (lighter, layered on top from the live edge) */}
          <motion.div
            className="absolute inset-y-0 rounded-full opacity-60"
            style={{ left: `${LIVE_PCT}%`, background: "#86c5ff" }}
            initial={reduced ? false : { width: 0 }}
            whileInView={reduced ? undefined : { width: `${PCT - LIVE_PCT}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="mono inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-faint)]">
            <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-signal)" }} />
            Live counts full
          </span>
          <span className="mono inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-faint)]">
            <span className="h-2 w-2 rounded-full opacity-60" style={{ background: "#86c5ff" }} />
            Wired counts half (still hardening)
          </span>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
          Derived from the matrix below — Live capabilities weigh 1.0, Wired 0.5,
          Standalone and Mock 0. The bar can never claim more than the matrix admits.
        </p>
      </div>
    </Reveal>
  );
}
