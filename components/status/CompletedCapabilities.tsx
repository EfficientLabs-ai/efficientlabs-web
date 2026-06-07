"use client";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { LAYERS, LEVELS, type Capability, type Level } from "@/lib/status";

/**
 * COMPLETED — what's live. The honest "what's done" view, derived ENTIRELY from
 * the same data/status.json that powers the matrix and the launch-progress bar.
 *
 * We surface only the capabilities that are real today — tier Live (running in
 * production, exercised by tests) and tier Wired (built + connected into the
 * daemon, hardening in progress). Standalone and Mock are deliberately excluded:
 * they are not "done", and this section is the no-spin answer to "what have you
 * actually finished?". Each item keeps its real tier badge, its source layer
 * (L0–L5), and its one-line detail straight from the matrix — nothing is
 * rewritten or upgraded. If a capability slips tier in status.json, it moves or
 * disappears here on the next build. No fabrication, in either direction.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

const DOT: Record<Level, string> = {
  live: "var(--color-signal)",
  wired: "#86c5ff",
  standalone: "#c9a24b",
  mock: "#5b6675",
};

// Only these tiers are "completed / live". Order matters: Live first.
const DONE_TIERS: Level[] = ["live", "wired"];

type DoneItem = Capability & { layerId: string; layerName: string };

// Flatten the matrix, keeping only Live + Wired, tagged with their source layer.
const DONE: DoneItem[] = LAYERS.flatMap((l) =>
  l.caps
    .filter((c) => DONE_TIERS.includes(c.level))
    .map((c) => ({ ...c, layerId: l.id, layerName: l.name }))
);

const LIVE_COUNT = DONE.filter((c) => c.level === "live").length;
const WIRED_COUNT = DONE.filter((c) => c.level === "wired").length;

function Badge({ level }: { level: Level }) {
  return (
    <span
      className="mono inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]"
      style={{
        borderColor: `color-mix(in oklab, ${DOT[level]} 40%, transparent)`,
        color: DOT[level],
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: DOT[level] }} />
      {LEVELS[level].label}
    </span>
  );
}

function DoneCard({ item, i }: { item: DoneItem; i: number }) {
  const reduced = useReducedMotion();
  return (
    <motion.li
      className="lm-card flex flex-col gap-2 p-4"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.45, ease: EASE, delay: Math.min(i * 0.03, 0.3) }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="mono shrink-0 rounded-md border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.06] px-1.5 py-0.5 text-[10px] text-[color:var(--color-signal)]"
            title={item.layerName}
          >
            {item.layerId}
          </span>
          <p className="min-w-0 text-[13.5px] leading-snug text-[color:var(--color-ink)]">
            {item.name}
          </p>
        </div>
        <Badge level={item.level} />
      </div>
      <p className="text-[12px] leading-snug text-[color:var(--color-ink-faint)]">
        {item.detail}
      </p>
    </motion.li>
  );
}

export default function CompletedCapabilities() {
  if (DONE.length === 0) return null;

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Completed</p>
            <h3 className="t-section mt-3">
              What&apos;s <span className="aurora-text">live</span> today.
            </h3>
          </div>
          <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">
            from the status matrix · {DONE.length} capabilities
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-[color:var(--color-ink-dim)]">
          The no-spin answer to &ldquo;what have you actually finished?&rdquo; — every
          item below is tier <span className="text-[color:var(--color-signal)]">Live</span>{" "}
          (running in production, exercised by tests) or{" "}
          <span style={{ color: DOT.wired }}>Wired</span> (built and connected into
          the daemon, hardening in progress), read straight from the same matrix you
          can audit at the bottom of this page. Standalone and Mock are not shown
          here — they are not done yet.
        </p>
      </Reveal>

      <Reveal delay={0.12}>
        <p className="mono mt-4 text-[12px] text-[color:var(--color-ink-faint)]">
          <span style={{ color: DOT.live }}>{LIVE_COUNT} Live</span> ·{" "}
          <span style={{ color: DOT.wired }}>{WIRED_COUNT} Wired</span>
        </p>
      </Reveal>

      <ul className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DONE.map((item, i) => (
          <DoneCard key={`${item.layerId}-${item.name}`} item={item} i={i} />
        ))}
      </ul>
    </div>
  );
}
