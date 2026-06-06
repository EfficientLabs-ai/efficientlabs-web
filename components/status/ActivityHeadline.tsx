"use client";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/Reveal";
import { ROLLUPS, REPOS, GENERATED_AT } from "@/components/status/activity";

/**
 * Headline counts — the at-a-glance proof of active work. Every number is read
 * straight from data/activity.json (real git history). If a count is 0 it shows
 * 0; there is no padding, no minimum, no "coming soon".
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

function Stat({
  value,
  label,
  sub,
  accent = false,
}: {
  value: number;
  label: string;
  sub: string;
  accent?: boolean;
}) {
  const reduced = useReducedMotion();
  return (
    <div className="lm-card flex flex-col gap-1 p-5">
      <motion.span
        className="display leading-none text-[clamp(1.9rem,5vw,2.6rem)]"
        style={{ color: accent ? "var(--color-signal)" : "var(--color-ink)" }}
        initial={reduced ? false : { opacity: 0, y: 10 }}
        whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {value.toLocaleString()}
      </motion.span>
      <span className="mono text-[12px] text-[color:var(--color-ink)]">{label}</span>
      <span className="text-[11px] leading-snug text-[color:var(--color-ink-faint)]">{sub}</span>
    </div>
  );
}

export default function ActivityHeadline() {
  const presentRepos = REPOS.filter((r) => r.present);
  const repoNames = presentRepos.map((r) => r.label).join(" + ") || "the repos";
  // Newest commit across all present repos → "last shipped" honesty signal.
  const newest = presentRepos
    .map((r) => r.newestAt)
    .filter((x): x is string => Boolean(x))
    .sort()
    .at(-1);

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Live activity</p>
            <h3 className="t-section mt-3">
              What we&apos;ve <span className="aurora-text">shipped</span>.
            </h3>
          </div>
          <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">
            from git history · {repoNames}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-[color:var(--color-ink-dim)]">
          These counts are generated at build time from the actual commit history of
          our repositories — not a marketing tally. Every deploy regenerates them,
          so what you see is the work as it lands.
        </p>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            value={ROLLUPS.totalCommits}
            label="commits"
            sub="across all tracked repos"
          />
          <Stat
            value={ROLLUPS.last7Days}
            label="last 7 days"
            sub="recent build velocity"
            accent
          />
          <Stat
            value={ROLLUPS.last30Days}
            label="last 30 days"
            sub="sustained progress"
          />
          <Stat
            value={ROLLUPS.featuresShipped}
            label="features"
            sub="conventional feat: commits"
            accent
          />
        </div>
      </Reveal>

      {(newest || GENERATED_AT) && (
        <Reveal delay={0.2}>
          <p className="mono mt-4 text-[11px] text-[color:var(--color-ink-faint)]">
            {newest && <>last commit {newest.slice(0, 10)} · </>}
            feed generated {GENERATED_AT.slice(0, 10)}
          </p>
        </Reveal>
      )}
    </div>
  );
}
