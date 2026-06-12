import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import RuntimeScoreBoard from "@/components/score/RuntimeScoreBoard";
import SectionCTA from "@/components/SectionCTA";
import { getLiveRuntimeScore } from "@/lib/runtime-score";

export const metadata: Metadata = {
  title: "Runtime Score — six measured sub-scores, nothing invented",
  description:
    "The Runtime Score: six MEASURED-only sub-scores from our own operating layer — runtime health, continuity, session economics, cost discipline, ownership, agent-readiness. Where something is not measured, the card says so and why. Verify every number yourself.",
  alternates: { canonical: "/score" },
};

// ISR 5m — same cadence as /status; the score renders the published artifact
// and falls back to the committed baseline (its generation date is shown).
export const revalidate = 300;

export default async function ScorePage() {
  const score = await getLiveRuntimeScore();
  return (
    <PageShell>
      <SubPageHero
        eyebrow="Runtime Score"
        crumb="Score"
        title={
          <>
            What can your stack <span className="aurora-text">prove</span> about itself?
          </>
        }
        lede={
          <>
            Six sub-scores, every one computed from measured telemetry our own operating layer emits —
            heartbeats, signed receipts, routing logs, session economics. No benchmarks invented, no
            industry averages, no dollar estimates. Where a number is not measured, the card says
            &ldquo;not measured&rdquo; and tells you why. Every card links the artifact that proves it.
          </>
        }
        facts={[
          { k: "Sub-scores", v: "6" },
          { k: "Data", v: "Measured only" },
          { k: "Source", v: "Our own node" },
          { k: "Verify", v: "Every card" },
          { k: "Refresh", v: "5 min ISR" },
        ]}
      />

      <section className="section scroll-mt-20">
        <RuntimeScoreBoard score={score} />
      </section>

      <section className="section scroll-mt-20 pt-0">
        <div className="lm-card p-6">
          <p className="kicker">Why this page exists</p>
          <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
            This is our node scoring itself, in public, with its warns showing. When you{" "}
            <Link href="/install" className="link-cta">install StratosAgent</Link>, your node gets the
            same six cards about itself — they start grey, and your first verified receipt lights the
            first one up. The point is not our score; it is that a score like this can exist at all:
            measured, portable, and verifiable without trusting the vendor —{" "}
            <Link href="/status" className="link-cta">the full status page</Link> carries the raw tiles.
          </p>
        </div>
        <SectionCTA label="Start here — score your setup, then light it up" href="/start" />
      </section>
    </PageShell>
  );
}
