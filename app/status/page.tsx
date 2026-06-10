import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import StatusMatrix from "@/components/acts/StatusMatrix";
import ActivityHeadline from "@/components/status/ActivityHeadline";
import LaunchProgress from "@/components/status/LaunchProgress";
import CompletedCapabilities from "@/components/status/CompletedCapabilities";
import ActivityFeed from "@/components/status/ActivityFeed";
import { getActivity } from "@/lib/live-activity";

export const metadata: Metadata = {
  title: "Status",
  description:
    "Commit-driven proof of work: headline counts and a recent-commit feed (refreshed from GitHub when reachable, otherwise the latest committed snapshot), an honest launch-progress bar, and the full L0–L5 capability matrix labelled Live, Wired, Standalone, or Mock. If it isn't real yet, it says so.",
  alternates: { canonical: "/status" },
};

// ISR — re-render at most every 5 min so the page tracks new commits with zero
// manual work, while staying well inside GitHub's rate limits.
export const revalidate = 300;

export default async function StatusPage() {
  // Pulled live from the GitHub API (ISR-cached), merged with the committed
  // history baseline. Falls back to the baseline if GitHub is unreachable.
  const activity = await getActivity();

  return (
    <PageShell>
      {/* ── 1 · live headline counts (real commit history, fetched live) ── */}
      <section className="section scroll-mt-20">
        <ActivityHeadline
          rollups={activity.rollups}
          repos={activity.repos}
          generatedAt={activity.generatedAt}
          live={activity.isLive}
        />
      </section>

      {/* ── 2 · honest launch-progress bar (driven by status.json levels) ── */}
      <section className="section scroll-mt-20 pt-0">
        <LaunchProgress />
      </section>

      {/* ── 3 · COMPLETED — what's live (Live + Wired caps, straight from data) ── */}
      <section className="section scroll-mt-20 pt-0">
        <CompletedCapabilities />
      </section>

      {/* ── 4 · the commit feed: the real, dated build log, most-recent first ── */}
      <section className="section scroll-mt-20 pt-0">
        <ActivityFeed
          days={activity.feedByDate}
          totalCommits={activity.rollups.totalCommits}
          repoPublic={activity.repoPublic}
          live={activity.isLive}
        />
      </section>

      {/* ── 5 · the honest L0–L5 capability matrix (the original source of truth) ── */}
      <section className="section scroll-mt-20 pt-0">
        <StatusMatrix />
      </section>
    </PageShell>
  );
}
