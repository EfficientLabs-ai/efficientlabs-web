"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/* ============================================================================
   CINEMATIC TRANSITION — a short scroll-scrubbed clip that BRIDGES two sections
   so the page reads as one continuous film. Same scrub mechanics as
   CinematicScrub, but lean: top + bottom void fades blend it seamlessly into the
   neighbouring sections, and a single centred line fades in at the apex.

   Decorative continuity only → renders nothing under reduced motion / no-JS, so
   no content is lost and the sections simply flow directly.
   ========================================================================== */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export default function CinematicTransition({
  dir,
  count,
  heightVh = 160,
  kicker,
  title,
}: {
  dir: string;
  count: number;
  heightVh?: number;
  kicker?: string;
  title?: ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const frames = useRef<(HTMLImageElement | null)[]>([]);
  const [p, setP] = useState(0);
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

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
    const io = new IntersectionObserver((es) => es[0]?.isIntersecting && start(), { rootMargin: "800px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, [on, dir, count]);

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

  useEffect(() => {
    if (!on) return;
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ready = (im?: HTMLImageElement | null) => !!im && im.complete && im.naturalWidth > 0;
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
    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, [on, count]);

  if (!on) return null;

  const textOp = smooth(0.28, 0.46, p) * (1 - smooth(0.62, 0.82, p));

  return (
    <section ref={wrap} className="relative" style={{ height: `${heightVh}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        {/* void blends top + bottom → seamless bridge into the neighbouring sections */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[40%]"
             style={{ background: "linear-gradient(to bottom, var(--color-void), transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%]"
             style={{ background: "linear-gradient(to top, var(--color-void), transparent)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 45%, rgba(6,8,14,0.4) 80%)" }} />
        {(kicker || title) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
               style={{ opacity: textOp }}>
            {kicker && <p className="kicker">{kicker}</p>}
            {title && <h2 className="t-section mt-3 max-w-2xl">{title}</h2>}
          </div>
        )}
      </div>
    </section>
  );
}
