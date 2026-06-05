"use client";
import { motion } from "motion/react";
import { ActHeader, Reveal } from "@/components/Reveal";
import { LAYERS, LEVELS, type Level } from "@/lib/status";

const DOT: Record<Level, string> = {
  live: "var(--color-signal)",
  wired: "#86c5ff",
  standalone: "#c9a24b",
  mock: "#5b6675",
};

const ALL_CAPS = LAYERS.flatMap((l) => l.caps);
const ORDER: Level[] = ["live", "wired", "standalone", "mock"];
const COUNTS = ORDER.map((lv) => ({ lv, n: ALL_CAPS.filter((c) => c.level === lv).length }));
const TOTAL = ALL_CAPS.length;

function Badge({ level }: { level: Level }) {
  return (
    <span className="mono inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]"
      style={{ borderColor: `color-mix(in oklab, ${DOT[level]} 40%, transparent)`, color: DOT[level] }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: DOT[level] }} />
      {LEVELS[level].label}
    </span>
  );
}

export default function StatusMatrix() {
  return (
    <div>
      <ActHeader index="05" kicker="The honest status" title={<>What&apos;s real. What&apos;s <span className="aurora-text">not yet</span>.</>}>
        Most infrastructure pages show you a roadmap and call it a product. This one shows you the
        running system — every capability labelled <em>Live</em>, <em>Wired</em>, <em>Standalone</em>,
        or <em>Mock</em>. If it isn&apos;t real yet, it says so. Honesty is the only durable moat.
      </ActHeader>

      {/* ── honesty scorecard ── */}
      <Reveal delay={0.1}>
        <div className="lm-card mt-9 p-6">
          {/* stacked proportion bar */}
          <div className="flex items-center justify-between">
            <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">{TOTAL} capabilities tracked</span>
            <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">live → mock</span>
          </div>
          <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-full">
            {COUNTS.map(({ lv, n }) => (
              <motion.div key={lv} className="h-full"
                style={{ background: DOT[lv] }}
                initial={{ width: 0 }}
                whileInView={{ width: `${(n / TOTAL) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
              />
            ))}
          </div>
          {/* count tiles */}
          <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-4">
            {COUNTS.map(({ lv, n }) => (
              <div key={lv} className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="display text-[1.5rem] leading-none sm:text-[1.8rem]" style={{ color: DOT[lv] }}>{n}</span>
                  <span className="h-2 w-2 rounded-full" style={{ background: DOT[lv] }} />
                </div>
                <span className="mono text-[11px] text-[color:var(--color-ink)]">{LEVELS[lv].label}</span>
                <span className="text-[11px] leading-snug text-[color:var(--color-ink-faint)]">{LEVELS[lv].blurb}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── matrix ── */}
      <div className="mt-8 space-y-3">
        {LAYERS.map((layer, li) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: li * 0.05 }}
            className="lm-card overflow-hidden"
          >
            <div className="grid gap-px md:grid-cols-[200px_minmax(0,1fr)]">
              <div className="flex items-center gap-3 px-5 py-4">
                <span className="mono rounded-md border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.06] px-2 py-0.5 text-[12px] text-[color:var(--color-signal)]">{layer.id}</span>
                <span className="text-[13px] font-medium text-[color:var(--color-ink)]">{layer.name}</span>
              </div>
              <ul className="min-w-0 divide-y divide-[color:rgba(255,255,255,0.05)] border-t border-[color:rgba(255,255,255,0.05)] md:border-l md:border-t-0">
                {layer.caps.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-4 px-5 py-3 transition-colors hover:bg-[color:rgba(255,255,255,0.02)]">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: DOT[c.level] }} />
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] text-[color:var(--color-ink)]">{c.name}</p>
                        <p className="truncate text-[12px] text-[color:var(--color-ink-faint)]">{c.detail}</p>
                      </div>
                    </div>
                    <Badge level={c.level} />
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
