"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Reveal } from "@/components/Reveal";

export default function StratosAgent() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  // gentle parallax: the scene drifts slower than the page (desktop full-bleed only)
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 1.0]);

  // the agent, above the cloud — animated (typing → waves hello → back to work, loops).
  // stratos-b.png is the poster + guaranteed fallback.
  const media = (className: string) => (
    <video
      className={className}
      src="/video/stratos-wave.mp4"
      poster="/img/stratos-b.png"
      autoPlay muted loop playsInline preload="metadata"
      aria-label="StratosAgent reclining and working in the stratosphere above Earth, waving hello"
    />
  );

  return (
    <section
      id="stratos"
      ref={ref}
      className="relative overflow-hidden lg:flex lg:min-h-screen lg:items-center"
    >
      {/* ── DESKTOP: immersive full-bleed scene behind a text card on the left ── */}
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10 hidden lg:block">
        {media("h-full w-full object-cover object-right")}
      </motion.div>
      {/* horizontal legibility wash: dark on the left, fading to reveal the scene on the right */}
      <div aria-hidden className="absolute inset-0 -z-10 hidden lg:block"
           style={{ background: "linear-gradient(90deg, var(--color-void) 8%, rgba(1,2,7,0.78) 38%, rgba(1,2,7,0.15) 64%, transparent 82%)" }} />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 hidden lg:block"
           style={{ background: "linear-gradient(0deg, var(--color-void), transparent)" }} />

      {/* ── MOBILE: the full agent-in-space scene at its own aspect ratio, then the copy below ── */}
      <div className="relative w-full overflow-hidden lg:hidden" style={{ aspectRatio: "1404 / 768" }}>
        {media("absolute inset-0 h-full w-full object-cover object-center")}
        {/* feather the edges so the scene melts into the page (no hard letterbox seams) */}
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-32"
             style={{ background: "linear-gradient(0deg, var(--color-void) 4%, transparent)" }} />
        <div aria-hidden className="absolute inset-x-0 top-0 h-16"
             style={{ background: "linear-gradient(180deg, var(--color-void), transparent)" }} />
      </div>

      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-4 lg:py-0">
        <div className="max-w-xl">
          <Reveal>
            <p className="kicker">StratosAgent</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="t-section mt-5">
              An agent that&apos;s <span className="aurora-text">out of this world</span>.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-[1.05rem] leading-relaxed text-[color:var(--color-ink-dim)]">
              Stratos lives in the stratosphere — above the cloud, never inside it. It runs on
              hardware you own, reasons locally, and reaches for a frontier model only when the
              ambiguity genuinely demands one. Calm, sovereign, and entirely yours.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <ul className="mt-8 space-y-3">
              {[
                ["Local-first", "Coding and routine work never leave your machine."],
                ["Cost-aware", "It asks before it spends a cent of your BYOK budget."],
                ["Sovereign", "No landlord can read it, throttle it, or switch it off."],
              ].map(([h, d]) => (
                <li key={h} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-signal)] shadow-[0_0_10px_var(--color-signal)]" />
                  <span className="text-[14px] text-[color:var(--color-ink-dim)]">
                    <span className="text-[color:var(--color-ink)]">{h}.</span> {d}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.32}>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#install" className="btn-signal">Install StratosAgent<span aria-hidden>→</span></a>
              <a href="#architecture" className="btn-outline">Meet the architecture</a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
