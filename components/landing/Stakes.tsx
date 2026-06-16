"use client";
import { useEffect, useRef, useState } from "react";
import SplitHeading from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/Reveal";

/* ============================================================================
   THE STAKES — "The Autonomous Accountability Bottleneck" (canon §2).
   Bespoke cinematic: an animated GAP chart — capability rising exponentially,
   accountability nearly flat — the widening gap shaded with tension, with the
   can't-answer questions floating inside the gap. Copy verbatim from
   WEBSITE_COPY_V2. Precise/legible content → hand-rendered (no generative
   footage), zero credits. Animates once on entry, then rests (reduced motion =
   final static state; SSR renders all copy for no-JS / SEO).
   ========================================================================== */

// The can't-answer list — verbatim (canon §2).
const CANT_ANSWER = [
  "Who acted?",
  "Who approved it?",
  "What model acted?",
  "What agent acted?",
  "What tool was used?",
  "What authority existed?",
  "What was denied?",
  "What did it cost?",
  "What receipt proves it?",
  "What outcome happened?",
  "Reuse, promote, quarantine, or kill?",
];

// Questions that float inside the widening gap (x%, y% within the chart).
const FLOATING = [
  { q: "Who acted?", x: 49, y: 50, at: 0.45 },
  { q: "Who approved it?", x: 62, y: 31, at: 0.58 },
  { q: "What did it cost?", x: 75, y: 58, at: 0.7 },
  { q: "What was denied?", x: 70, y: 44, at: 0.8 },
  { q: "What receipt proves it?", x: 84, y: 36, at: 0.9 },
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function GapChart() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [prog, setProg] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setProg(1); return; }
    let raf = 0, start = 0, running = false;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 1700);
      setProg(easeOut(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => {
      if (es[0]?.isIntersecting && !running) { running = true; raf = requestAnimationFrame(tick); io.disconnect(); }
    }, { threshold: 0.35 });
    if (wrap.current) io.observe(wrap.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  // draw the chart whenever progress changes
  useEffect(() => {
    const canvas = cv.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padL = 8, padR = 8, baseY = h * 0.84, topY = h * 0.14;
    const x0 = padL, x1 = w - padR, span = x1 - x0;
    const P = prog;
    const cap = (x: number) => baseY - (baseY - topY) * Math.pow(x, 2.5);     // capability ↑ (exponential)
    const acc = (x: number) => baseY - (baseY - topY) * 0.14 * x;             // accountability (~flat)

    // baseline grid
    ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) { const gy = topY + (baseY - topY) * (i / 4); ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); }

    const N = 80;
    const lastN = Math.max(1, Math.floor(N * P));

    // gap fill (between the curves) up to progress — the bottleneck, in tension red
    ctx.beginPath();
    for (let i = 0; i <= lastN; i++) { const x = i / N; const sx = x0 + x * span; if (i === 0) ctx.moveTo(sx, acc(x)); else ctx.lineTo(sx, acc(x)); }
    for (let i = lastN; i >= 0; i--) { const x = i / N; const sx = x0 + x * span; ctx.lineTo(sx, cap(x)); }
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, topY, 0, baseY);
    grad.addColorStop(0, `rgba(255,90,90,${0.16 * P})`);
    grad.addColorStop(1, `rgba(255,90,90,${0.03 * P})`);
    ctx.fillStyle = grad; ctx.fill();

    const curve = (fn: (x: number) => number, color: string, lw: number, glow: number) => {
      ctx.beginPath();
      for (let i = 0; i <= lastN; i++) { const x = i / N; const sx = x0 + x * span; if (i === 0) ctx.moveTo(sx, fn(x)); else ctx.lineTo(sx, fn(x)); }
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = "round";
      if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
      ctx.stroke(); ctx.shadowBlur = 0;
    };
    curve(acc, "rgba(120,140,170,0.65)", 1.6, 0);              // accountability — dim, flat
    curve(cap, "#0a84ff", 2.4, 14);                            // capability — bright, glowing

    // head dots
    const hx = x0 + (lastN / N) * span;
    ctx.fillStyle = "#7cc4ff"; ctx.beginPath(); ctx.arc(hx, cap(lastN / N), 3.5, 0, 6.28); ctx.fill();
    ctx.fillStyle = "rgba(150,170,200,0.8)"; ctx.beginPath(); ctx.arc(hx, acc(lastN / N), 2.5, 0, 6.28); ctx.fill();
  }, [prog]);

  return (
    <div ref={wrap} className="relative mt-12 w-full">
      <div className="relative h-[300px] w-full sm:h-[380px]">
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        {/* curve labels */}
        <span className="mono absolute left-1 top-2 text-[10.5px] tracking-[0.18em] text-[color:var(--color-signal)]" style={{ opacity: prog }}>CAPABILITY ↑</span>
        <span className="mono absolute bottom-9 right-2 text-[10.5px] tracking-[0.18em] text-[color:var(--color-ink-faint)]" style={{ opacity: prog }}>ACCOUNTABILITY →</span>
        {/* floating can't-answer questions inside the gap */}
        {FLOATING.map((f) => {
          const o = Math.max(0, Math.min(1, (prog - f.at) / 0.12));
          return (
            <span key={f.q}
              className="mono absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[11px] sm:text-[12.5px] text-[color:var(--color-ink-dim)]"
              style={{ left: `${f.x}%`, top: `${f.y}%`, opacity: o }}>
              <span className="text-[color:var(--color-signal)]">?</span> {f.q}
            </span>
          );
        })}
      </div>
      {/* the framing line — the payoff under the chart */}
      <p className="mt-6 text-center text-[1.05rem] text-[color:var(--color-ink)] sm:text-[1.25rem]" style={{ opacity: prog }}>
        The gap is not what AI can do. <span className="aurora-text">It&apos;s what you can account for.</span>
      </p>
    </div>
  );
}

export default function Stakes() {
  return (
    <section id="stakes" className="section section-t relative overflow-hidden scroll-mt-20">
      <div className="container-x relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="kicker">The category</p>
          <SplitHeading as="h2" className="t-section mt-6">
            The Autonomous <span className="aurora-text">Accountability Bottleneck</span>.
          </SplitHeading>
          <Reveal delay={0.14}>
            <p className="t-body-lg mt-7 text-[color:var(--color-ink-dim)]">
              The world is gaining autonomous intelligence faster than it is gaining the
              infrastructure to own, govern, verify, coordinate and safely use it. AI no longer
              just answers — it reasons, acts, codes, operates tools, coordinates with other
              agents, touches sensitive data, and is beginning to transact.{" "}
              <span className="text-[color:var(--color-ink)]">Capability is compounding. Accountability is not.</span>
            </p>
          </Reveal>
        </div>

        {/* the cinematic gap visual */}
        <div className="mx-auto max-w-4xl">
          <GapChart />
        </div>

        {/* the can't-answer list + closing */}
        <div className="mx-auto mt-16 max-w-4xl">
          <Reveal>
            <p className="mono text-center text-[12px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faint)]">
              For any autonomous action, can you prove — not on faith —
            </p>
          </Reveal>
          <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {CANT_ANSWER.map((q, i) => (
              <Reveal key={q} delay={(i % 3) * 0.05}>
                <div className="flex items-baseline gap-3 border-b border-[color:var(--color-line)] py-3">
                  <span className="mono text-[11px] text-[color:var(--color-signal)]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[14px] text-[color:var(--color-ink-dim)]">{q}</span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.1}>
            <p className="mt-8 text-center text-[1.05rem] leading-relaxed text-[color:var(--color-ink-dim)]">
              Most AI stacks cannot answer these. That inability —{" "}
              <span className="text-[color:var(--color-ink)]">not a lack of capability</span> — is the bottleneck.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
