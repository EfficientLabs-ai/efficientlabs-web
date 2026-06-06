import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

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
  children,
}: {
  id?: string;
  index: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="section section-t scroll-mt-24">
      <div className="container-x">
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
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
