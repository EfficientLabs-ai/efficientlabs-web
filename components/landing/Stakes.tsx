"use client";
import { useEffect, useRef, useState } from "react";
import SplitHeading from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/Reveal";

/* ============================================================================
   THE STAKES — "The Autonomous Accountability Bottleneck" (canon §2).
   Bespoke cinematic: a polished GAP chart — capability rising exponentially,
   accountability nearly flat — the widening gap shaded in tension, with data
   particles climbing the capability curve and the can't-answer questions laid
   out in a clean organized column. Copy verbatim from WEBSITE_COPY_V2.
   Hand-rendered (legible content), zero generation credits. Draws in on entry,
   then keeps a subtle ambient (particles + head pulse). Reduced motion = final
   static state; SSR renders all copy for no-JS / SEO.
   ========================================================================== */

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

// the questions surfaced inside the chart, as an organized column
const IN_CHART = [
  "Who acted?",
  "Who approved it?",
  "What did it cost?",
  "What was denied?",
  "What receipt proves it?",
];

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function GapChart() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const [prog, setProg] = useState(0);

  // entrance progress (drives the DOM question column + the canvas draw-in)
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, start = 0, armed = false;
    if (reduce) {
      // Reduced motion = the final static state. Defer the setState out of the
      // effect body (no synchronous cascading render).
      raf = requestAnimationFrame(() => setProg(1));
      return () => cancelAnimationFrame(raf);
    }
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / 1700);
      setProg(easeOut(p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => {
      if (es[0]?.isIntersecting && !armed) { armed = true; raf = requestAnimationFrame(tick); io.disconnect(); }
    }, { threshold: 0.3 });
    if (wrap.current) io.observe(wrap.current);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, []);

  // keep the latest progress for the always-on canvas loop
  const progRef = useRef(0);
  useEffect(() => { progRef.current = prog; }, [prog]);

  // continuous canvas loop — draw-in tracks progress, then ambient particles/pulse
  useEffect(() => {
    const canvas = cv.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0, w = 0, h = 0, frame = 0, visible = true;

    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const io = new IntersectionObserver((es) => { visible = !!es[0]?.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    const mobile = () => w < 640;
    const seed = (i: number) => { const x = Math.sin(i * 12.9898) * 43758.5; return x - Math.floor(x); };

    const draw = () => {
      if (!visible) { raf = requestAnimationFrame(draw); return; } // pause off-screen
      const P = progRef.current;
      const t = frame / 60;
      const padL = 10, padR = 10, baseY = h * 0.82, topY = h * 0.13;
      const x0 = padL, x1 = w - padR, span = x1 - x0;
      const cap = (x: number) => baseY - (baseY - topY) * Math.pow(x, 2.5);
      const acc = (x: number) => baseY - (baseY - topY) * 0.13 * x;
      const SX = (x: number) => x0 + x * span;

      ctx.clearRect(0, 0, w, h);

      // horizontal gridlines + faint vertical ticks
      ctx.strokeStyle = "rgba(255,255,255,0.045)"; ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) { const gy = topY + (baseY - topY) * (i / 4); ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke(); }
      ctx.strokeStyle = "rgba(255,255,255,0.03)";
      for (let i = 1; i <= 6; i++) { const gx = x0 + span * (i / 7); ctx.beginPath(); ctx.moveTo(gx, topY); ctx.lineTo(gx, baseY); ctx.stroke(); }

      const N = 90;
      const lastN = Math.max(1, Math.floor(N * P));

      // capability area fill (subtle blue) under its curve
      ctx.beginPath(); ctx.moveTo(x0, baseY);
      for (let i = 0; i <= lastN; i++) { const x = i / N; ctx.lineTo(SX(x), cap(x)); }
      ctx.lineTo(SX(lastN / N), baseY); ctx.closePath();
      const blueFill = ctx.createLinearGradient(0, topY, 0, baseY);
      blueFill.addColorStop(0, `rgba(10,132,255,${0.18 * P})`);
      blueFill.addColorStop(1, "rgba(10,132,255,0)");
      ctx.fillStyle = blueFill; ctx.fill();

      // the accountability gap (between the curves) — tension red
      ctx.beginPath();
      for (let i = 0; i <= lastN; i++) { const x = i / N; if (i === 0) ctx.moveTo(SX(x), acc(x)); else ctx.lineTo(SX(x), acc(x)); }
      for (let i = lastN; i >= 0; i--) { const x = i / N; ctx.lineTo(SX(x), cap(x)); }
      ctx.closePath();
      const redFill = ctx.createLinearGradient(0, topY, 0, baseY);
      redFill.addColorStop(0, `rgba(255,86,86,${0.17 * P})`);
      redFill.addColorStop(1, `rgba(255,86,86,${0.02 * P})`);
      ctx.fillStyle = redFill; ctx.fill();

      const stroke = (fn: (x: number) => number, color: string, lw: number, glow: number) => {
        ctx.beginPath();
        for (let i = 0; i <= lastN; i++) { const x = i / N; if (i === 0) ctx.moveTo(SX(x), fn(x)); else ctx.lineTo(SX(x), fn(x)); }
        ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineJoin = "round";
        if (glow) { ctx.shadowColor = color; ctx.shadowBlur = glow; }
        ctx.stroke(); ctx.shadowBlur = 0;
      };
      stroke(acc, "rgba(130,150,180,0.6)", 1.6, 0);
      stroke(cap, "#0a84ff", 2.6, 16);

      // data particles climbing the capability curve (ambient, after draw-in)
      if (P > 0.55 && !reduce) {
        const count = mobile() ? 7 : 13;
        for (let i = 0; i < count; i++) {
          const sp = 0.05 + seed(i) * 0.05;
          const s = (t * sp + seed(i + 50)) % 1;       // 0..1 along the visible curve
          const x = 0.12 + s * 0.86;
          if (x > P) continue;
          const fade = Math.sin(s * Math.PI);           // fade at both ends
          ctx.fillStyle = `rgba(150,200,255,${0.85 * fade * (P - 0.55) / 0.45})`;
          ctx.beginPath(); ctx.arc(SX(x), cap(x), 1.8, 0, 6.28); ctx.fill();
        }
      }

      // pulsing head dots
      const hx = SX(lastN / N);
      const pulse = 1 + Math.sin(t * 2.2) * 0.25;
      ctx.fillStyle = "#9fc8ff";
      ctx.shadowColor = "#0a84ff"; ctx.shadowBlur = 10 * P;
      ctx.beginPath(); ctx.arc(hx, cap(lastN / N), 3.6 * (P > 0.98 ? pulse : 1), 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(150,170,200,0.75)";
      ctx.beginPath(); ctx.arc(hx, acc(lastN / N), 2.4, 0, 6.28); ctx.fill();

      // "NOW" marker at the right edge (where the gap is widest)
      if (P > 0.9) {
        const nx = SX(0.985);
        ctx.strokeStyle = `rgba(255,255,255,${0.12 * (P - 0.9) / 0.1})`; ctx.lineWidth = 1; ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(nx, topY); ctx.lineTo(nx, baseY); ctx.stroke(); ctx.setLineDash([]);
      }

      frame++;
      raf = requestAnimationFrame(draw);
    };
    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); io.disconnect(); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div ref={wrap} className="relative mt-12 w-full">
      <div className="relative h-[340px] w-full sm:h-[440px]">
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />

        {/* axis + curve labels */}
        <span className="mono absolute right-2 top-2 text-[10px] tracking-[0.18em] text-[color:var(--color-signal)]" style={{ opacity: prog }}>CAPABILITY ↑</span>
        <span className="mono absolute bottom-7 right-2 text-[10px] tracking-[0.18em] text-[color:var(--color-ink-faint)]" style={{ opacity: prog }}>ACCOUNTABILITY</span>
        <span className="mono absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-[color:var(--color-ink-faint)]" style={{ opacity: prog * 0.8 }}>TIME →</span>
        {/* the gap, named */}
        <span className="mono absolute right-[6%] top-[44%] text-[10px] tracking-[0.16em] text-[color:#ff8a8a]" style={{ opacity: prog * 0.9 }}>THE&nbsp;GAP</span>

        {/* the can't-answer questions — organized column in the open upper-left */}
        <div className="absolute left-[5%] top-[11%] flex flex-col gap-2.5 sm:gap-3.5">
          <span className="mono text-[10px] tracking-[0.18em] text-[color:var(--color-ink-faint)]" style={{ opacity: prog }}>CAN YOU PROVE —</span>
          {IN_CHART.map((q, i) => {
            const at = 0.4 + i * 0.11;
            const o = Math.max(0, Math.min(1, (prog - at) / 0.12));
            return (
              <span key={q} className="flex items-center gap-2 text-[12px] sm:text-[13.5px] text-[color:var(--color-ink-dim)]"
                style={{ opacity: o, transform: `translateX(${(1 - o) * -8}px)` }}>
                <span className="text-[color:var(--color-signal)]">?</span>{q}
              </span>
            );
          })}
        </div>
      </div>

      {/* the framing line */}
      <p className="mt-7 text-center text-[1.05rem] text-[color:var(--color-ink)] sm:text-[1.25rem]" style={{ opacity: prog }}>
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

        <div className="mx-auto max-w-4xl">
          <GapChart />
        </div>

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
