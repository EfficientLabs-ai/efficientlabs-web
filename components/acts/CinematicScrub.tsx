"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ============================================================================
   CINEMATIC SCRUB — the generic scroll-is-the-playhead engine.

   A pinned section draws a Higgsfield-generated frame sequence onto a canvas,
   the current frame chosen by scroll progress (no <video> seeking — that janks
   on iOS; a webp frame sequence scrubs smoothly). DOM "beats" cross-fade on top
   (cinematic-primary, copy on top), behind a left-anchored legibility scrim.

   Frames lazy-load only when the section nears the viewport, so the page stays
   light. Base state (no-JS / reduced motion) = clean stacked glass cards.
   ========================================================================== */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export type Beat = {
  at: number; // centre position in 0..1
  n: string;
  name: string;
  full: string;
  layer?: string;
  role: string;
  status: string;
  color: string;
  blurb: string;
  cta: { label: string; href: string };
};

export default function CinematicScrub({
  dir,
  count,
  beats,
  heightVh = 700,
  eyebrow,
  heading,
}: {
  dir: string;
  count: number;
  beats: Beat[];
  heightVh?: number;
  eyebrow?: string;
  heading?: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const [p, setP] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setOn(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Lazy-load the frame sequence once the section approaches the viewport.
  useEffect(() => {
    if (!on) return;
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      frames.current = new Array(count).fill(null);
      for (let i = 0; i < count; i++) {
        const img = new Image();
        img.src = `${dir}/${String(i + 1).padStart(4, "0")}.webp`;
        frames.current[i] = img;
      }
    };
    const io = new IntersectionObserver(
      (es) => es[0]?.isIntersecting && start(),
      { rootMargin: "800px" },
    );
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, [on, dir, count]);

  // Scroll progress over the pinned section (Lenis-friendly sticky idiom).
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const v = total > 0 ? clamp01(-el.getBoundingClientRect().top / total) : 0;
      progress.current = v;
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
  }, [on]);

  // Draw loop — cover-fit the frame nearest to the scroll position that's loaded.
  useEffect(() => {
    if (!on) return;
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ready = (img: HTMLImageElement | null | undefined) =>
      !!img && img.complete && img.naturalWidth > 0;
    const nearest = (idx: number) => {
      const a = frames.current;
      if (ready(a[idx])) return a[idx]!;
      for (let d = 1; d < count; d++) {
        if (idx - d >= 0 && ready(a[idx - d])) return a[idx - d]!;
        if (idx + d < count && ready(a[idx + d])) return a[idx + d]!;
      }
      return null;
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const idx = Math.min(count - 1, Math.max(0, Math.round(progress.current * (count - 1))));
      const img = nearest(idx);
      if (img) {
        const s = Math.max(w / img.naturalWidth, h / img.naturalHeight);
        const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      }
      raf = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [on, count]);

  const band = 0.5 / Math.max(1, beats.length);
  const beatOpacity = (at: number) =>
    smooth(at - band * 1.9, at - band * 0.5, p) *
    (1 - smooth(at + band * 0.5, at + band * 1.9, p));
  const activeIdx = Math.round(p * (beats.length - 1));

  // BASE STATE — stacked glass cards (SSR / no-JS / reduced motion).
  if (!on) {
    return (
      <section className="section section-t">
        <div className="mx-auto max-w-6xl px-5">
          {eyebrow && <p className="kicker">{eyebrow}</p>}
          {heading && <h2 className="t-section mt-4 max-w-3xl">{heading}</h2>}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {beats.map((b) => (
              <div key={b.n} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">{b.n}</span>
                  <span className="mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.08em]" style={{ color: b.color }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />{b.status}
                  </span>
                </div>
                <h3 className="t-card-title mt-3">{b.name}</h3>
                <p className="mt-0.5 text-[13.5px] text-[color:var(--color-ink)]">{b.full}</p>
                <p className="mono mt-1.5 text-[11px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">{b.role}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">{b.blurb}</p>
                <a href={b.cta.href} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80" style={{ color: b.color }}>
                  {b.cta.label}<span aria-hidden>→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // IMMERSIVE STATE — scrubbed film + cross-faded beats.
  return (
    <section ref={wrap} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        {/* left-anchored legibility scrim so copy stays readable over bright footage */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "linear-gradient(90deg, rgba(6,8,14,0.88) 0%, rgba(6,8,14,0.55) 32%, rgba(6,8,14,0) 60%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(130% 100% at 55% 50%, transparent 52%, var(--color-void) 100%)" }} />

        {/* header */}
        <div className="pointer-events-none absolute inset-x-0 top-[12vh] mx-auto max-w-6xl px-5 md:top-[14vh]">
          {eyebrow && <p className="kicker">{eyebrow}</p>}
          {heading && <h2 className="t-section mt-3 max-w-md md:max-w-lg">{heading}</h2>}
        </div>

        {/* compact progress rail (desktop) */}
        <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3.5 md:flex">
          {beats.map((b, i) => {
            const act = i === activeIdx;
            return (
              <div key={b.n} className="flex items-center gap-2.5" style={{ opacity: act ? 1 : 0.45, transition: "opacity 0.3s" }}>
                <span className="mono text-[11px]" style={{ color: act ? b.color : "var(--color-ink-faint)" }}>{b.n}</span>
                <span className="h-px transition-all duration-300" style={{ width: act ? 26 : 10, background: act ? b.color : "var(--color-ink-faint)" }} />
              </div>
            );
          })}
        </div>

        {/* beats — cross-faded glass panels */}
        {beats.map((b) => {
          const op = beatOpacity(b.at);
          if (op <= 0.01) return null;
          return (
            <div key={b.n}
                 className="absolute inset-x-0 bottom-[8vh] px-5 md:bottom-auto md:left-24 md:top-1/2 md:max-w-md md:-translate-y-1/2 md:px-0"
                 style={{ opacity: op, pointerEvents: op > 0.5 ? "auto" : "none" }}>
              <div className="glass mx-auto max-w-md rounded-2xl p-6 md:mx-0">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">{b.n} / {String(beats.length).padStart(2, "0")}</span>
                  <span className="mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] tracking-[0.1em]"
                        style={{ color: b.color, background: `color-mix(in oklab, ${b.color} 14%, transparent)` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />{b.status}
                  </span>
                </div>
                {b.layer && <p className="mono mt-3 text-[10px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">{b.layer}</p>}
                <p className="mono mt-1.5 text-[11px] uppercase tracking-[0.18em]" style={{ color: b.color }}>{b.role}</p>
                <h3 className="t-card-title mt-1.5 text-[1.75rem]">{b.name}</h3>
                <p className="mt-1 text-[14px] text-[color:var(--color-ink)]">{b.full}</p>
                <p className="mt-3.5 text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">{b.blurb}</p>
                <a href={b.cta.href} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80" style={{ color: b.color }}>
                  {b.cta.label}<span aria-hidden>→</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
