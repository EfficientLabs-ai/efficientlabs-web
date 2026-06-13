import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import StatusMatrix from "@/components/acts/StatusMatrix";
import ActivityHeadline from "@/components/status/ActivityHeadline";
import LaunchProgress from "@/components/status/LaunchProgress";
import CompletedCapabilities from "@/components/status/CompletedCapabilities";
import ActivityFeed from "@/components/status/ActivityFeed";
import VerdictBar from "@/components/proof/VerdictBar";
import ReceiptVerifyCard from "@/components/proof/ReceiptVerifyCard";
import DropBundleVerify from "@/components/proof/DropBundleVerify";
import RuntimeIntelligence from "@/components/proof/RuntimeIntelligence";
import ActivationRoadmap from "@/components/proof/ActivationRoadmap";
import ReadinessTile from "@/components/proof/ReadinessTile";
import { getActivity } from "@/lib/live-activity";
import { getLiveStatus } from "@/lib/public-status";

export const metadata: Metadata = {
  title: "Status",
  description:
    "Proof, not marketing: the operating layer's heartbeat verdict, signed capability receipts verified in your own browser, measured routing and cache telemetry, the activation matrix with its gaps shown, the commit feed, and the full L0–L5 capability matrix. Where something is not measured, it says 'not measured'.",
  alternates: { canonical: "/status" },
};

// ISR — re-render at most every 5 min so the page tracks new commits with zero
// manual work, while staying well inside GitHub's rate limits. The operating-
// layer tiles render from the committed public-status artifact (event-driven,
// staleness shown per tile).
export const revalidate = 300;

export default async function StatusPage() {
  // Pulled live from the GitHub API (ISR-cached), merged with the committed
  // history baseline. Falls back to the baseline if GitHub is unreachable.
  const activity = await getActivity();
  // Live operating-layer tiles — fetched at request time from the cron-published feed (ISR 5m),
  // falling back to the committed baseline if unreachable. Staleness is rendered per tile.
  const tiles = (await getLiveStatus()).tiles;

  return (
    <PageShell>
      {/* ── A · the verdict: is the system healthy? (answered in one glance,
             warns included — a status page that is always green is an ad) ── */}
      <section className="section scroll-mt-20">
        <p className="kicker">System health</p>
        <h3 className="t-section mt-3">
          The operating layer, <span className="aurora-text">as it is</span>.
        </h3>
        <div className="mt-7">
          <VerdictBar tile={tiles.heartbeat} />
        </div>
        <div className="mt-3">
          <ReadinessTile tile={tiles.readiness} />
        </div>
        <p className="mono mt-3 text-[11px] text-[color:var(--color-ink-faint)]">
          The same telemetry, scored:{" "}
          <Link href="/score" className="link-cta">the Runtime Score — six measured sub-scores →</Link>
        </p>
      </section>

      {/* ── B · the proof hero: verification runs in YOUR browser ── */}
      <section className="section scroll-mt-20 pt-0" id="verify">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <ReceiptVerifyCard tile={tiles.receipts} />
          <div className="lm-card p-6">
            <p className="kicker">What just ran in your browser</p>
            <ul className="mt-4 space-y-2 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
              <li>· The published receipt bundle was fetched and its hash chain replayed receipt-by-receipt.</li>
              <li>· Both halves of every hybrid signature were checked — Ed25519 and ML-DSA-65, both must pass.</li>
              <li>· The node identity was derived from the public key here, not trusted from the file.</li>
              <li>· The result shown is this run&apos;s result. Altering, removing, or reordering any receipt breaks it.</li>
            </ul>
            <p className="mono mt-4 text-[11px] text-[color:var(--color-ink-faint)]">
              One chain, counted honestly — early and small, and verifiable by anyone holding only the public
              key. Receipts record hashes, identity, and measured cost units. Never content, never a price.
            </p>
          </div>
        </div>
        {/* the onboarding checklist's "or drop the bundle" promise — local-only verify */}
        <div className="mt-3">
          <DropBundleVerify />
        </div>
      </section>

      {/* ── C · live headline counts (real commit history, fetched live) ── */}
      <section className="section scroll-mt-20 pt-0">
        <ActivityHeadline
          rollups={activity.rollups}
          repos={activity.repos}
          generatedAt={activity.generatedAt}
          live={activity.isLive}
        />
      </section>

      {/* ── D · runtime intelligence — measured telemetry from the layer itself ── */}
      <section className="section scroll-mt-20 pt-0">
        <p className="kicker">Runtime intelligence</p>
        <h3 className="t-section mt-3">
          Measured, or it <span className="aurora-text">doesn&apos;t render</span>.
        </h3>
        <div className="mt-7">
          <RuntimeIntelligence
            routing={tiles.routing}
            economics={tiles.economics}
            intelligence={tiles.intelligence}
          />
        </div>
      </section>

      {/* ── E · activation matrix — the denominator, gaps shown ── */}
      <section className="section scroll-mt-20 pt-0">
        <ActivationRoadmap tile={tiles.activation} />
      </section>

      {/* ── honest launch-progress bar (driven by status.json levels) ── */}
      <section className="section scroll-mt-20 pt-0">
        <LaunchProgress />
      </section>

      {/* ── COMPLETED — what's live (Live + Wired caps, straight from data) ── */}
      <section className="section scroll-mt-20 pt-0">
        <CompletedCapabilities />
      </section>

      {/* ── the commit feed: the real, dated build log, most-recent first ── */}
      <section className="section scroll-mt-20 pt-0">
        <ActivityFeed
          days={activity.feedByDate}
          totalCommits={activity.rollups.totalCommits}
          repoPublic={activity.repoPublic}
          live={activity.isLive}
        />
      </section>

      {/* ── the honest L0–L5 capability matrix (the original source of truth) ── */}
      <section className="section scroll-mt-20 pt-0">
        <StatusMatrix />
      </section>
    </PageShell>
  );
}
