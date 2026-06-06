import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import StatusMatrix from "@/components/acts/StatusMatrix";
import ActivityHeadline from "@/components/status/ActivityHeadline";
import LaunchProgress from "@/components/status/LaunchProgress";
import ActivityFeed from "@/components/status/ActivityFeed";

export const metadata: Metadata = {
  title: "Status",
  description:
    "Live, commit-driven proof of work. Headline counts and a recent-commit feed generated at build time from real git history, an honest launch-progress bar, and the full L0–L5 capability matrix labelled Live, Wired, Standalone, or Mock. If it isn't real yet, it says so.",
  alternates: { canonical: "/status" },
};

export default function StatusPage() {
  return (
    <PageShell>
      {/* ── 1 · live headline counts (real git history) ── */}
      <section className="section scroll-mt-20">
        <ActivityHeadline />
      </section>

      {/* ── 2 · honest launch-progress bar (driven by status.json levels) ── */}
      <section className="section scroll-mt-20 pt-0">
        <LaunchProgress />
      </section>

      {/* ── 3 · the commit feed: what we shipped, most-recent first ── */}
      <section className="section scroll-mt-20 pt-0">
        <ActivityFeed />
      </section>

      {/* ── 4 · the honest L0–L5 capability matrix (the original source of truth) ── */}
      <section className="section scroll-mt-20 pt-0">
        <StatusMatrix />
      </section>
    </PageShell>
  );
}
