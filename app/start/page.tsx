import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import RuntimeScoreBoard from "@/components/score/RuntimeScoreBoard";
import StartJourney from "@/components/onboarding/StartJourney";
import { GREY_SCORE } from "@/lib/onboarding";

export const metadata: Metadata = {
  title: "Start — score your setup, then run a sovereign node",
  description:
    "The onboarding journey: see what your current setup cannot prove (six honest grey cards), answer one question, then the five-step checklist. Steps 1–2 and 4–5 need no account; pairing is the only account-bound step. The public status page is the live demo.",
  alternates: { canonical: "/start" },
};

export default function StartPage() {
  return (
    <PageShell>
      <SubPageHero
        eyebrow="Start"
        crumb="Start"
        title={
          <>
            First: what can your current setup <span className="aurora-text">prove</span>?
          </>
        }
        lede={
          <>
            Before any install instruction, score what you run today. Six cards, all grey — because
            nothing about your setup is measured yet. Each one says exactly what would light it up.
            That gap is the product. No survey walls, and no account needed until the one step that
            genuinely requires it — or skip everything and{" "}
            <a href="#checklist" className="link-cta">just install</a>.
          </>
        }
        facts={[
          { k: "Steps", v: "5" },
          { k: "Account needed", v: "Step 3 only" },
          { k: "Surveys", v: "One question" },
          { k: "Demo", v: "Live status page" },
          { k: "Free tier", v: "Forever" },
        ]}
      />

      {/* ── the Runtime Score moment: the aha BEFORE install (spec §2.2) ── */}
      <section className="section scroll-mt-20">
        <RuntimeScoreBoard score={GREY_SCORE} />
        <p className="mono mt-3 text-[11px] text-[color:var(--color-ink-faint)]">
          Not a mock — this is the honest shape of &ldquo;no node yet&rdquo;. A live node&apos;s scoreboard looks like{" "}
          <Link href="/score" className="link-cta">ours</Link>, warns showing; the{" "}
          <Link href="/status" className="link-cta">public status page</Link> is the running demo.
        </p>
      </section>

      {/* ── one question → the five steps (framing changes, steps never do) ── */}
      <section className="section scroll-mt-20 pt-0">
        <StartJourney />
      </section>
    </PageShell>
  );
}
