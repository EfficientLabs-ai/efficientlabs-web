"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";

/**
 * Standalone deep-page hero. Unlike the homepage acts, every nav sub-page opens
 * with this: a breadcrumb trail back to home, an eyebrow + big display title, a
 * lede, optional fact-strip, and a glow that signals "this is a destination, not
 * a scroll-section of the homepage". Visually consistent with the site but
 * deliberately NOT the homepage hero.
 */
export default function SubPageHero({
  eyebrow,
  crumb,
  title,
  lede,
  facts,
  children,
}: {
  eyebrow: string;
  crumb: string;
  title: ReactNode;
  lede: ReactNode;
  facts?: { k: string; v: string }[];
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-8rem] h-[34rem] w-[52rem] -translate-x-1/2 rounded-full opacity-[0.13] blur-[130px]"
          style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            background:
              "linear-gradient(transparent 0, transparent calc(100% - 1px), var(--color-edge) 100%), linear-gradient(90deg, transparent 0, transparent calc(100% - 1px), var(--color-edge) 100%)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(120% 80% at 50% 0, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(120% 80% at 50% 0, #000, transparent 75%)",
          }}
        />
      </div>

      <div className="container-x relative pb-12 pt-4">
        {/* breadcrumbs */}
        <Reveal>
          <nav aria-label="Breadcrumb" className="mono flex items-center gap-2 text-[12px] text-[color:var(--color-ink-faint)]">
            <Link href="/" className="transition-colors hover:text-[color:var(--color-signal)]">Home</Link>
            <ChevronRight size={13} aria-hidden className="opacity-60" />
            <span className="text-[color:var(--color-ink-dim)]">{crumb}</span>
          </nav>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 inline-flex items-center gap-3">
            <span className="kicker">{eyebrow}</span>
            <span className="h-px w-10 bg-[color:var(--color-edge)]" />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="t-display-sm mt-5 max-w-4xl">{title}</h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="t-body-lg mt-7 max-w-2xl text-[color:var(--color-ink-dim)]">{lede}</p>
        </Reveal>

        {facts && facts.length > 0 && (
          <Reveal delay={0.22}>
            <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)] sm:grid-cols-4">
              {facts.map((f) => (
                <div key={f.k} className="bg-[color:var(--color-void-2)]/40 px-4 py-4">
                  <dt className="mono text-[10px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">{f.k}</dt>
                  <dd className="mt-1.5 text-[13px] font-medium text-[color:var(--color-ink)]">{f.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}

        {children && <div className="mt-10">{children}</div>}
      </div>
    </header>
  );
}
