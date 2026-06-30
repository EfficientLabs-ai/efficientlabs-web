"use client";
import { useEffect, useRef, useState } from "react";
import TypewriterHeading, { type TwSeg } from "@/components/motion/TypewriterHeading";
import { useMotionAllowed } from "@/lib/use-motion-allowed";

/* ============================================================================
   HERO — a real, seamless-looping cinematic brand film (full-screen autoplay,
   muted, looped). NOT scroll-scrubbed: the only scroll behaviour is the
   full-screen → site transition (the film recedes + the copy lifts as you
   begin to scroll, releasing into the page). Reduced-motion / no-JS = the
   static poster frame. Transform/opacity only (compositor-safe).
   ========================================================================== */

const TITLE: TwSeg[] = [
  { text: "Own and prove", accent: true },
  { break: true },
  { text: "everything your AI does." },
];

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export default function HeroVideo() {
  const wrap = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(0);
  const motionOk = useMotionAllowed();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const v = total > 0 ? clamp01(-el.getBoundingClientRect().top / total) : 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setP(v));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // full-screen → site transition over the first ~55% of the section's scroll
  const t = clamp01(p / 0.55);
  const filmScale = 1 + t * 0.08;
  const filmOpacity = 1 - t * 0.5;
  const copyOpacity = 1 - clamp01(p / 0.4);
  const copyY = -t * 44;

  return (
    <section ref={wrap} className="cinematic relative h-[150vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* the film */}
        <div className="absolute inset-0 will-change-transform"
             style={{ transform: `scale(${filmScale})`, opacity: filmOpacity }}>
          {motionOk ? (
            <video
              className="h-full w-full object-cover"
              autoPlay muted loop playsInline preload="metadata"
              poster="/media/hero/hero-poster.jpg"
            >
              <source src="/media/hero/hero-loop.mp4" type="video/mp4" />
            </video>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/media/hero/hero-poster.jpg" alt="" className="h-full w-full object-cover" />
          )}
        </div>

        {/* legibility scrims */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(120% 95% at 50% 44%, transparent 28%, rgba(6,8,14,0.5) 72%, var(--color-void) 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
             style={{ background: "linear-gradient(to top, var(--color-void), transparent)" }} />

        {/* copy overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
             style={{ opacity: copyOpacity, transform: `translateY(${copyY}px)`, pointerEvents: copyOpacity > 0.4 ? "auto" : "none" }}>
          <p className="kicker">AI you actually own</p>
          <TypewriterHeading as="h1" segments={TITLE} className="t-display mt-5 max-w-4xl" />
          <p className="t-body-lg mt-7 mx-auto max-w-2xl text-[color:var(--color-ink-dim)]">
            Your prompts, workflows, and deliverables shouldn&apos;t vanish into someone
            else&apos;s chat window. Keep every step your AI takes — on infrastructure you
            own — and prove it with a receipt anyone can verify.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <a href="/start" className="btn-signal">Start free<span aria-hidden>→</span></a>
            <a href="/status" className="btn-outline">See it prove itself</a>
          </div>
          <p className="mt-6 text-[13px] text-[color:var(--color-ink-faint)]">
            Free forever. Your work stays yours — even if you cancel.
          </p>
        </div>

        {/* scroll cue → "enter the site" */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
             style={{ opacity: 1 - clamp01(p / 0.14) }}>
          <span className="mono text-[10px] tracking-[0.3em] text-[color:var(--color-ink-faint)]">ENTER</span>
          <span className="block h-9 w-px bg-gradient-to-b from-[color:var(--color-signal)] to-transparent"
                style={{ animation: "scroll-cue 1.8s ease-in-out infinite" }} />
        </div>
      </div>
    </section>
  );
}
