// lib/live-activity.ts — LIVE, real-time proof-of-work.
// ============================================================================
// The build-time generator (scripts/build-activity-feed.mjs → data/activity.json)
// gave us a committed HISTORY baseline. This module makes the /status page update
// itself with ZERO manual work: it fetches recent commits straight from the
// GitHub REST API at request time (ISR-cached for 5 min), merges them with the
// baseline, and recomputes the rollups. The moment a repo goes public, its
// commits start flowing in automatically — no rebuild, no redeploy, no edit.
//
// SAFETY / HONESTY (same invariants as the build script):
//   - We read ONLY the commit subject (first message line), ISO date, and sha.
//     No author name/email ever enters the pipeline. Subjects are scrubbed for
//     emails + control chars before display.
//   - REAL DATA ONLY. A repo that 404s (private + no token, or absent) simply
//     contributes nothing — never a fabricated commit. If GitHub is unreachable,
//     we fall back to the committed baseline verbatim.
//   - Optional GITHUB_READ_TOKEN (server-only env, never shipped to the client)
//     lets the page also track PRIVATE repos' cadence (metadata only). Without
//     it, only public repos are fetched live — which is exactly the launch goal.
// ============================================================================
import staticData from "@/data/activity.json";
import type {
  Activity,
  ActivityEntry,
  CommitType,
  FeedDay,
  RepoMeta,
} from "@/components/status/activity";

const ORG = "EfficientLabs-ai";
const FEED_LIMIT = 80;
const PER_REPO = 100; // GitHub max per page
export const REVALIDATE = 300; // 5 min — near-real-time, rate-limit-safe

type LiveRepo = { key: string; label: string; repo: string };

// The repos we surface on /status. Each is fetched live; private ones are
// silently skipped unless a read token is present. Labels match the baseline so
// overlapping commits dedupe cleanly.
const LIVE_REPOS: LiveRepo[] = [
  { key: "core", label: "atmosphere-core", repo: "atmosphere-core" },
  { key: "atmos", label: "TheAtmosphere", repo: "TheAtmosphere" },
  { key: "stratos", label: "StratosAgent", repo: "StratosAgent" },
  { key: "web", label: "efficientlabs-web", repo: "efficientlabs-web" },
];

const KNOWN = new Set<CommitType>([
  "feat", "fix", "docs", "chore", "refactor",
  "test", "perf", "build", "ci", "style", "revert",
]);

function classify(subject: string): CommitType {
  const m = /^([a-zA-Z]+)(?:\([^)]*\))?!?:/.exec(subject);
  if (!m) return "other";
  const t = m[1].toLowerCase() as CommitType;
  return KNOWN.has(t) ? t : "other";
}

function scrubSubject(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/[\x00-\x1f]/g, "")
    .replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, "[redacted]")
    .trim();
}

type GhResult<T> = { ok: boolean; status: number; data: T | null };

async function gh<T>(path: string): Promise<GhResult<T>> {
  const token = process.env.GITHUB_READ_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "efficientlabs-status",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(`https://api.github.com${path}`, {
      headers,
      next: { revalidate: REVALIDATE },
    });
    const data = res.ok ? ((await res.json()) as T) : null;
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: null };
  }
}

type GhCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } | null };
};
type GhRepo = { visibility?: string; private?: boolean };

export type LiveActivity = Activity & {
  /** label → true when GitHub reports the repo public (drives the UI honestly). */
  repoPublic: Record<string, boolean>;
  /** true when at least one repo was fetched live this render. */
  isLive: boolean;
};

function entryKey(e: { repoLabel: string; hash: string }): string {
  return `${e.repoLabel}#${e.hash}`;
}

export async function getActivity(): Promise<LiveActivity> {
  const base = staticData as Activity;

  const liveEntries: ActivityEntry[] = [];
  const repoPublic: Record<string, boolean> = {};
  const liveRepoMeta = new Map<string, RepoMeta>();

  await Promise.all(
    LIVE_REPOS.map(async (r) => {
      const repoUrl = `https://github.com/${ORG}/${r.repo}`;

      // visibility — lets the UI flip "private until launch" → "open" on its own.
      const meta = await gh<GhRepo>(`/repos/${ORG}/${r.repo}`);
      const isPublic =
        meta.ok && (meta.data?.visibility === "public" || meta.data?.private === false);
      repoPublic[r.label] = Boolean(isPublic);

      const commitsRes = await gh<GhCommit[]>(
        `/repos/${ORG}/${r.repo}/commits?per_page=${PER_REPO}`,
      );
      if (!commitsRes.ok || !Array.isArray(commitsRes.data)) return;

      let newestMs = -Infinity;
      let count = 0;
      for (const c of commitsRes.data) {
        const iso = c.commit?.author?.date;
        if (!iso) continue;
        const subjectRaw = (c.commit?.message ?? "").split("\n")[0];
        const ms = Date.parse(iso);
        if (!Number.isNaN(ms) && ms > newestMs) newestMs = ms;
        count += 1;
        liveEntries.push({
          iso,
          date: iso.slice(0, 10),
          subject: scrubSubject(subjectRaw),
          repo: r.key,
          repoLabel: r.label,
          type: classify(subjectRaw),
          hash: c.sha.slice(0, 7),
          commitUrl: c.html_url || `${repoUrl}/commit/${c.sha}`,
        });
      }
      liveRepoMeta.set(r.label, {
        key: r.key,
        label: r.label,
        present: count > 0,
        commits: count,
        newestAt: newestMs === -Infinity ? null : new Date(newestMs).toISOString(),
        repoUrl,
      });
    }),
  );

  // GitHub unreachable / all private with no token → serve the baseline as-is.
  if (liveEntries.length === 0) {
    return { ...base, repoPublic, isLive: false };
  }

  // Merge: live wins (working URLs, freshest), baseline fills deeper history.
  const seen = new Set<string>();
  const merged: ActivityEntry[] = [];
  for (const e of liveEntries) {
    const k = entryKey(e);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(e);
  }
  for (const e of base.feed) {
    const k = entryKey(e);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(e);
  }

  merged.sort((a, b) => {
    const d = Date.parse(b.iso) - Date.parse(a.iso);
    if (d !== 0) return d;
    if (a.repo !== b.repo) return a.repo < b.repo ? -1 : 1;
    return a.subject < b.subject ? -1 : a.subject > b.subject ? 1 : 0;
  });

  // Rollups over the full merged set (counts ALL, not just the rendered slice).
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const cut7 = now - 7 * DAY;
  const cut30 = now - 30 * DAY;
  const byType: Partial<Record<CommitType, number>> = {};
  let last7 = 0;
  let last30 = 0;
  for (const c of merged) {
    byType[c.type] = (byType[c.type] || 0) + 1;
    const ms = Date.parse(c.iso);
    if (ms >= cut7) last7 += 1;
    if (ms >= cut30) last30 += 1;
  }

  const feed = merged.slice(0, FEED_LIMIT);

  // Group the rendered slice by date (newest first) — same reshaping as the build.
  const order: string[] = [];
  const map = new Map<string, ActivityEntry[]>();
  for (const c of feed) {
    if (!map.has(c.date)) {
      map.set(c.date, []);
      order.push(c.date);
    }
    map.get(c.date)!.push(c);
  }
  const feedByDate: FeedDay[] = order.map((date) => {
    const commits = map.get(date)!;
    const dayTypes: Partial<Record<CommitType, number>> = {};
    for (const c of commits) dayTypes[c.type] = (dayTypes[c.type] || 0) + 1;
    return { date, count: commits.length, byType: dayTypes, commits };
  });

  // Repo provenance: prefer live meta; keep any baseline repo we didn't fetch.
  const repos: RepoMeta[] = [...liveRepoMeta.values()];
  for (const r of base.repos) {
    if (!liveRepoMeta.has(r.label)) repos.push(r);
  }

  return {
    generatedAt: new Date().toISOString(),
    repos,
    rollups: {
      totalCommits: merged.length,
      last7Days: last7,
      last30Days: last30,
      featuresShipped: byType.feat || 0,
      activeDays: feedByDate.length,
      byType,
    },
    feed,
    feedByDate,
    repoPublic,
    isLive: true,
  };
}
