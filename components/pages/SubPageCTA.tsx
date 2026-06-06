import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { Reveal } from "@/components/Reveal";

/**
 * Closing block shared by every standalone sub-page: a focused CTA, a pair of
 * actions, and an explicit "back to overview" link home so the deep pages never
 * feel like dead ends. Mirrors the homepage closing-CTA language without reusing
 * its component.
 */
export default function SubPageCTA({
  kicker,
  title,
  body,
  primary,
  secondary,
}: {
  kicker: string;
  title: ReactNode;
  body?: ReactNode;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

  return (
    <section className="section section-t relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.15] blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--color-signal), transparent 60%)" }}
        />
      </div>

      <div className="container-x relative text-center">
        <Reveal>
          <p className="kicker">{kicker}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="t-section mx-auto mt-6 max-w-2xl">{title}</h2>
        </Reveal>
        {body && (
          <Reveal delay={0.14}>
            <p className="mx-auto mt-6 max-w-xl text-[1.02rem] leading-relaxed text-[color:var(--color-ink-dim)]">{body}</p>
          </Reveal>
        )}
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            {isInternal(primary.href) ? (
              <Link href={primary.href} className="btn-signal">{primary.label}<span aria-hidden>→</span></Link>
            ) : (
              <a href={primary.href} className="btn-signal">{primary.label}<span aria-hidden>→</span></a>
            )}
            {secondary &&
              (isInternal(secondary.href) ? (
                <Link href={secondary.href} className="btn-outline">{secondary.label}</Link>
              ) : (
                <a href={secondary.href} className="btn-outline">{secondary.label}</a>
              ))}
          </div>
        </Reveal>
        <Reveal delay={0.26}>
          <div className="mt-12">
            <Link
              href="/"
              className="mono inline-flex items-center gap-2 text-[12px] text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-signal)]"
            >
              <ArrowLeft size={14} aria-hidden />
              Back to overview
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
