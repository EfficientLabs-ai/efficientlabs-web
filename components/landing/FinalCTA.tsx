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
            <p data-motion="body" className="kicker">Own your AI work</p>
            <SplitHeading as="h2" className="t-section mt-6">
              Your work, finally{" "}
              <span className="aurora-text">yours to keep</span>.
            </SplitHeading>
            <p data-motion="body" className="t-body-lg mx-auto mt-6 max-w-xl text-[color:var(--color-ink-dim)]">
              Start free and keep every workflow your AI runs — owned on infrastructure you
              control, provable with a receipt anyone can verify, and yours even if you walk away.
            </p>
            <div data-motion="cta" className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
              <a href="/start" className="btn-signal w-full justify-center sm:w-auto">
                Start free<span aria-hidden>→</span>
              </a>
              <a href="/status" className="btn-outline w-full justify-center sm:w-auto">
                Verify a receipt yourself
              </a>
            </div>
          </SectionEntrance>
        </GlassCard>
      </div>
    </section>
  );
}
