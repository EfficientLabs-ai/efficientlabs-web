import Aurora from "@/components/glass/Aurora";
import GlassCard from "@/components/glass/GlassCard";
import SplitHeading from "@/components/motion/SplitHeading";
import SectionEntrance from "@/components/motion/SectionEntrance";

/**
 * FINAL CTA — one frosted glass panel over a centered aurora. Names the gap,
 * then offers the two free, low-risk doors (assessment / install). No price on
 * this surface, by rule. Copy server-rendered; motion is transform+opacity.
 */
export default function FinalCTA() {
  return (
    <section id="get-started" className="section section-t relative overflow-hidden scroll-mt-20">
      <Aurora variant="center" />
      <div className="container-x relative">
        <GlassCard className="mx-auto max-w-3xl px-6 py-14 text-center sm:px-12 sm:py-16">
          <SectionEntrance variant="statement">
            <p data-motion="body" className="kicker">Find out where you stand</p>
            <SplitHeading as="h2" className="t-section mt-6">
              Find out what your AI{" "}
              <span className="aurora-text">can&apos;t prove yet</span>.
            </SplitHeading>
            <p data-motion="body" className="t-body-lg mx-auto mt-6 max-w-xl text-[color:var(--color-ink-dim)]">
              Five minutes, no install required. See the gaps between what your stack does and
              what it can prove — then close them on infrastructure you own.
            </p>
            <div data-motion="cta" className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <a href="/score" className="btn-signal w-full justify-center sm:w-auto">
                Run your free readiness assessment<span aria-hidden>→</span>
              </a>
              <a href="/start" className="btn-outline w-full justify-center sm:w-auto">
                Install free forever
              </a>
            </div>
          </SectionEntrance>
        </GlassCard>
      </div>
    </section>
  );
}
