"use client";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { siGithub } from "simple-icons";
import { Reveal } from "@/components/Reveal";
import {
  FEED,
  FEED_BY_DATE,
  PUBLIC_REPOS,
  typeMeta,
  type ActivityEntry,
  type FeedDay,
} from "@/components/status/activity";

/**
 * The commit feed — a real, dated build log across our repos. Commits are
 * GROUPED BY DATE (newest day first); each day shows how many commits landed and
 * each row shows the source repo, the conventional-commit type, the scrubbed
 * subject (no emails, no secrets — guaranteed by the build script), and a
 * per-commit link to its GitHub commit page (built from the repo URL + sha).
 *
 * Above the feed sits a frosted glass header with "View on GitHub" buttons for
 * the public product repos. They 404 until we go public at launch, so we say so
 * honestly rather than hiding them.
 *
 * The log is split into "newer" days (shown by default) and "older" days
 * (revealed via a Show-more toggle) so the page stays light while still exposing
 * the full slice. The grouping is computed at build time (data/activity.json →
 * feedByDate); the same commits also exist flat in FEED — both are the identical
 * underlying git data, never invented here.
 *
 * If the feed is empty (a fresh repo with no history), we render an honest empty
 * state rather than fabricating activity.
 */

const EASE = [0.2, 0.8, 0.2, 1] as const;

// How many DAYS to show before the "Show older commits" toggle.
const INITIAL_VISIBLE_DAYS = 3;

// Format YYYY-MM-DD → "Sat · June 6, 2026" (UTC-stable, no locale surprises).
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function formatDay(ymd: string): string {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  if (!y || !m || !d) return ymd;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${WEEKDAYS[dt.getUTCDay()]} · ${MONTHS[m - 1]} ${d}, ${y}`;
}

function GithubMark({ size = 14 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={siGithub.path} />
    </svg>
  );
}

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
        {/* per-commit GitHub link — built from repoUrl + full sha at build time.
            404s until the repo is public; the sha is the honest truth either way. */}
        {entry.commitUrl && entry.hash && (
          <a
            href={entry.commitUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`View commit ${entry.hash} on GitHub`}
            className="mono inline-flex items-center gap-1 rounded-[var(--radius-xs)] border border-[color:var(--color-line)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-ink-faint)] transition-colors hover:border-[color:var(--color-signal)]/40 hover:text-[color:var(--color-signal)]"
          >
            <GithubMark size={11} />
            {entry.hash}
          </a>
        )}
      </div>
      <p className="mt-1.5 text-[13.5px] leading-snug text-[color:var(--color-ink-dim)]">
        {entry.subject}
      </p>
    </motion.li>
  );
}

/** One calendar day's worth of commits: a dated header + its rows. */
function DayGroup({ day, base }: { day: FeedDay; base: number }) {
  const feats = day.byType.feat ?? 0;
  return (
    <li className="relative">
      <Reveal>
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[color:var(--color-line)] pb-2">
          <time
            dateTime={day.date}
            className="mono text-[12.5px] text-[color:var(--color-ink)]"
          >
            {formatDay(day.date)}
          </time>
          <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
            {day.count} commit{day.count === 1 ? "" : "s"}
            {feats > 0 && (
              <span style={{ color: "var(--color-signal)" }}> · {feats} feature{feats === 1 ? "" : "s"}</span>
            )}
          </span>
        </div>
      </Reveal>
      <ol className="mt-5 space-y-6 border-l border-[color:var(--color-line)] pl-1">
        {day.commits.map((e, j) => (
          <Row
            key={e.hash ? `${e.repo}-${e.hash}` : `${e.repo}-${e.iso}-${j}`}
            entry={e}
            i={base + j}
          />
        ))}
      </ol>
    </li>
  );
}

export default function ActivityFeed({
  days: daysProp,
  totalCommits: totalProp,
  repoPublic = {},
  live = false,
}: {
  days?: FeedDay[];
  totalCommits?: number;
  repoPublic?: Record<string, boolean>;
  live?: boolean;
} = {}) {
  // Prefer the live, GitHub-fetched feed passed from the /status server page;
  // fall back to the committed baseline (data/activity.json) so the page still
  // renders if GitHub is unreachable. Either way: real commits, never invented.
  const days: FeedDay[] =
    daysProp && daysProp.length > 0
      ? daysProp
      : FEED_BY_DATE.length > 0
        ? FEED_BY_DATE
        : FEED.length > 0
          ? [{ date: FEED[0].date, count: FEED.length, byType: {}, commits: FEED }]
          : [];

  const totalCommits = totalProp ?? days.reduce((n, d) => n + d.count, 0);
  const anyPublic = Object.values(repoPublic).some(Boolean);
  const allListedPublic = PUBLIC_REPOS.every((r) => repoPublic[r.name]);
  const [showAll, setShowAll] = useState(false);

  const hasMore = days.length > INITIAL_VISIBLE_DAYS;
  const visibleDays = showAll ? days : days.slice(0, INITIAL_VISIBLE_DAYS);
  const hiddenDays = days.length - INITIAL_VISIBLE_DAYS;
  const hiddenCommits = days
    .slice(INITIAL_VISIBLE_DAYS)
    .reduce((n, d) => n + d.count, 0);

  // Prefix-sum of commit counts so each day's first row continues the stagger
  // delay across day boundaries. Pure (no mutation during render).
  const dayBases = visibleDays.reduce<number[]>((acc, d, idx) => {
    acc.push(idx === 0 ? 0 : acc[idx - 1] + visibleDays[idx - 1].count);
    return acc;
  }, []);

  return (
    <div>
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="display flex items-center gap-2.5 text-[1.25rem] text-[color:var(--color-ink)]">
            Recent commits
            {live && (
              <span className="mono inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-signal)]/40 px-2 py-0.5 text-[9px] tracking-wider text-[color:var(--color-signal)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--color-signal)]" style={{ boxShadow: "0 0 7px var(--color-signal)" }} />
                LIVE
              </span>
            )}
          </h3>
          <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
            most recent {totalCommits} commits · {days.length} day{days.length === 1 ? "" : "s"} · {live ? "from GitHub · " : ""}newest first
          </span>
        </div>
      </Reveal>

      {/* ── frosted header: View-on-GitHub buttons for the public product repos ── */}
      <Reveal delay={0.06}>
        <div className="glass mt-6 rounded-[var(--radius-lg)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="mono text-[12px] text-[color:var(--color-ink)]">
              The code, in the open
            </p>
            <span className="mono text-[10px] text-[color:var(--color-ink-faint)]">
              repositories · {PUBLIC_REPOS.length}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {PUBLIC_REPOS.map((r) => {
              const open = Boolean(repoPublic[r.name]);
              return (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={open ? `${r.blurb} — open on GitHub` : `${r.blurb} — public at launch`}
                  className="btn-outline !py-2 text-[12px]"
                >
                  <GithubMark size={14} />
                  <span className="mono">{r.name}</span>
                  {/* live public-state dot — flips on its own the moment the repo opens */}
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: open ? "var(--color-signal)" : "var(--color-ink-faint)",
                      boxShadow: open ? "0 0 7px var(--color-signal)" : "none",
                    }}
                    title={open ? "public" : "private until launch"}
                  />
                  <span aria-hidden className="text-[color:var(--color-ink-faint)]">↗</span>
                </a>
              );
            })}
          </div>

          {/* honest note — reflects the LIVE public/private state, no manual edits */}
          <p className="mt-3 text-[11px] leading-relaxed text-[color:var(--color-ink-faint)]">
            {allListedPublic ? (
              <>
                These repositories are <span className="text-[color:var(--color-ink-dim)]">open</span> — browse the
                full source, and every per-commit link below resolves on GitHub.
              </>
            ) : anyPublic ? (
              <>
                Repositories with a lit dot are <span className="text-[color:var(--color-ink-dim)]">open now</span>;
                the rest go public as they&apos;re ready. This page reflects each repo&apos;s real
                state live — no manual updates.
              </>
            ) : (
              <>
                These repositories go <span className="text-[color:var(--color-ink-dim)]">public at launch</span> —
                the links above 404 until then, and flip live the moment they open. The
                per-commit links below point at the same repos.
              </>
            )}
          </p>
        </div>
      </Reveal>

      {days.length === 0 ? (
        <Reveal delay={0.1}>
          <div className="lm-card mt-6 p-6">
            <p className="text-[14px] text-[color:var(--color-ink-dim)]">
              No commit history is available in this build. When the repos have
              history, recent work appears here automatically.
            </p>
          </div>
        </Reveal>
      ) : (
        <>
          <ol className="mt-7 space-y-9">
            {visibleDays.map((day, idx) => (
              <DayGroup key={day.date} day={day} base={dayBases[idx]} />
            ))}
          </ol>

          {hasMore && (
            <div className="mt-9 flex justify-center">
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="btn-outline !py-2 text-[12px]"
              >
                {showAll
                  ? "Show fewer days"
                  : `Show ${hiddenDays} older day${hiddenDays === 1 ? "" : "s"} · ${hiddenCommits} commit${hiddenCommits === 1 ? "" : "s"}`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
