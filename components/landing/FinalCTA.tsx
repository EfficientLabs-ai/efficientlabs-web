import GlassCard from "@/components/glass/GlassCard";
import SplitHeading from "@/components/motion/SplitHeading";
import SectionEntrance from "@/components/motion/SectionEntrance";

/**
 * FINAL CTA — a frosted glass panel over a cinematic ambient backdrop (the sovereign
 * core, generated for us). Names the gap, then offers the two free, low-risk doors
 * (assessment / install). No price on this surface, by rule. The backdrop is a static
 * CSS image (no layout/filter tweens); a vignette keeps the card legible.
 */
export default function FinalCTA() {
  return (
    <section id="get-started" className="section section-t relative overflow-hidden scroll-mt-20">
      {/* cinematic backdrop — the luminous sovereign core in the void */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-[0.6]"
           style={{ backgroundImage: "url('/media/core-ambient.webp')" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0"
           style={{ background: "radial-gradient(120% 100% at 50% 45%, transparent 14%, color-mix(in srgb, var(--color-void) 80%, transparent) 58%, var(--color-void) 100%)" }} />
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
