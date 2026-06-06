"use client";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { FEED, typeMeta, type ActivityEntry } from "@/components/status/activity";

/**
 * The commit feed — a timeline of real, recent commits across our repos. Each
 * row shows the date, the source repo, the conventional-commit type, and the
 * scrubbed subject (no emails, no secrets — guaranteed by the build script).
 *
 * If FEED is empty (a fresh repo with no history), we render an honest empty
 * state rather than fabricating activity.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

function Row({ entry, i }: { entry: ActivityEntry; i: number }) {
  const reduced = useReducedMotion();
  const meta = typeMeta(entry.type);
  return (
    <motion.li
      className="relative pl-7"
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px" }}
      transition={{ duration: 0.45, ease: EASE, delay: Math.min(i * 0.02, 0.3) }}
    >
      <span
        className="absolute left-0 top-2 h-2 w-2 rounded-full"
        style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
      />
      <div className="flex flex-wrap items-center gap-2.5">
        <time className="mono text-[12px] text-[color:var(--color-ink-faint)]">{entry.date}</time>
        <span
          className="mono rounded-full border px-2 py-0.5 text-[10px]"
          style={{
            borderColor: `color-mix(in oklab, ${meta.color} 40%, transparent)`,
            color: meta.color,
          }}
        >
          {meta.label}
        </span>
        <span className="mono rounded-full border border-[color:var(--color-line)] px-2 py-0.5 text-[10px] text-[color:var(--color-ink-faint)]">
          {entry.repoLabel}
        </span>
      </div>
      <p className="mt-1.5 text-[13.5px] leading-snug text-[color:var(--color-ink-dim)]">
        {entry.subject}
      </p>
    </motion.li>
  );
}

export default function ActivityFeed() {
  const items = FEED;

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="display text-[1.25rem] text-[color:var(--color-ink)]">
            Recent commits
          </h3>
          <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
            most recent {items.length} · newest first
          </span>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <Reveal delay={0.08}>
          <div className="lm-card mt-6 p-6">
            <p className="text-[14px] text-[color:var(--color-ink-dim)]">
              No commit history is available in this build. When the repos have
              history, recent work appears here automatically.
            </p>
          </div>
        </Reveal>
      ) : (
        <ol className="mt-7 space-y-6 border-l border-[color:var(--color-line)] pl-1">
          {items.map((e, i) => (
            <Row key={`${e.repo}-${e.iso}-${i}`} entry={e} i={i} />
          ))}
        </ol>
      )}
    </div>
  );
}
