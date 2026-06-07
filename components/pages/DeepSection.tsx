import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import MediaFrame, { type Media } from "@/components/pages/MediaFrame";

/**
 * A numbered deep-content section for the standalone sub-pages. Gives every page
 * a consistent "chapter" rhythm: index + kicker + heading + lede, then arbitrary
 * body. Distinct from the homepage `ActHeader` (which centres a short narrative
 * act) — this is denser, left-aligned, and built for in-depth reading.
 */
export default function DeepSection({
  id,
  index,
  kicker,
  title,
  lede,
  media,
  children,
}: {
  id?: string;
  index: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  /** Optional media banner shown between the section header and its body. Additive. */
  media?: Media;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section section-t relative scroll-mt-24">
      {/* soft aurora glow so any glass DeepCards in the body read as frosted */}
      <div aria-hidden className="aurora-field">
        <div className="glow glow-azure left-1/2 top-1/2 h-[26rem] w-[44rem] -translate-x-1/2 -translate-y-1/2" />
        <div className="glow glow-cyan -left-16 bottom-10 h-[22rem] w-[28rem]" />
        <div className="glow glow-violet -right-12 top-24 h-[22rem] w-[28rem]" />
      </div>
      <div className="container-x relative z-10">
        <div className="max-w-2xl">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="mono text-[12px] text-[color:var(--color-signal)]">{index}</span>
              <span className="h-px w-8 bg-[color:var(--color-edge)]" />
              <span className="kicker">{kicker}</span>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="t-section mt-5">{title}</h2>
          </Reveal>
          {lede && (
            <Reveal delay={0.14}>
              <p className="mt-5 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-dim)]">{lede}</p>
            </Reveal>
          )}
        </div>
        {media && (
          <Reveal delay={0.18}>
            <div className="lm-card mt-10 overflow-hidden p-1.5">
              <MediaFrame
                {...media}
                aspect={media.aspect ?? "aspect-[16/7]"}
                className={`rounded-[var(--radius)] ${media.className ?? ""}`}
              />
            </div>
          </Reveal>
        )}

        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
