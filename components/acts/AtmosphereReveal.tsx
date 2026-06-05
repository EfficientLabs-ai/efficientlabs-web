"use client";
import { useRef, useEffect, useState } from "react";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const R = (s: number) => { // tiny seeded rng for stable layout
  let x = Math.sin(s) * 10000; return x - Math.floor(x);
};

export default function AtmosphereReveal() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const [p, setP] = useState(0);

  // scroll progress over the pinned section
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      const el = wrap.current; if (!el) return;
      const total = el.offsetHeight - window.innerHeight;
      const v = total > 0 ? Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total)) : 0;
      progress.current = v;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setP(v));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);

  // canvas: cloud (extraction + heat) → dissolve → sky + world mesh
  useEffect(() => {
    const canvas = cv.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, frame = 0;

    let stars: { x: number; y: number; r: number; tw: number }[] = [];
    let racks: { x: number; y: number; w: number; h: number; dx: number; dy: number; seed: number }[] = [];
    let users: { x: number; y: number }[] = [];
    let heat: { x: number; y: number; v: number; s: number }[] = [];
    let surfN: { x: number; y: number }[] = [];
    let orbitN: { x: number; y: number }[] = [];
    let ascendN: { x: number; baseY: number; phase: number; spd: number }[] = [];
    const earth = { cx: 0, cy: 0, R: 0, apex: 0 };
    const limb = (x: number) => earth.cy - Math.sqrt(Math.max(0, earth.R * earth.R - (x - earth.cx) * (x - earth.cx)));

    function resize() {
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = Math.floor(w * dpr); canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: 160 }, (_, i) => ({ x: R(i + 1) * w, y: R(i + 99) * h * 0.75, r: R(i + 7) * 1.2 + 0.2, tw: R(i + 3) * 6.28 }));
      // "cloud infrastructure" — a datacenter block of server racks (the hyperscaler)
      const dcx = w * 0.5, dcy = h * 0.55;
      const cols = 9, rows = 5;
      const blockW = Math.min(w * 0.36, 440), blockH = Math.min(h * 0.26, 230);
      const ux = blockW / cols, uy = blockH / rows;
      racks = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const x = dcx - blockW / 2 + c * ux, y = dcy - blockH / 2 + r * uy;
        const ang = Math.atan2((y + uy / 2) - dcy, (x + ux / 2) - dcx);
        racks.push({ x, y, w: ux * 0.84, h: uy * 0.72, dx: Math.cos(ang), dy: Math.sin(ang), seed: R(r * cols + c + 5) });
      }
      users = Array.from({ length: 13 }, (_, i) => ({ x: w * (0.08 + 0.84 * (i / 12)), y: h * (0.82 + R(i + 51) * 0.12) }));
      heat = Array.from({ length: 40 }, (_, i) => ({ x: dcx + (R(i + 61) - 0.5) * w * 0.34, y: dcy + h * 0.12, v: R(i + 71) * 0.5 + 0.2, s: R(i + 81) }));
      // an Earth limb: a large circle whose apex sits near the lower third —
      // nodes are spread along its curvature (around the world)
      const cxw = w * 0.5;
      earth.cx = cxw; earth.R = w * 1.18; earth.apex = h * 0.80; earth.cy = earth.apex + earth.R;
      surfN = Array.from({ length: 17 }, (_, i) => { const x = w * (0.05 + 0.9 * (i / 16)); return { x, y: limb(x) - h * 0.012 }; });
      const Rorbit = earth.R + h * 0.16;
      orbitN = Array.from({ length: 9 }, (_, i) => { const x = w * (0.14 + 0.72 * (i / 8)); return { x, y: earth.cy - Math.sqrt(Math.max(0, Rorbit * Rorbit - (x - cxw) * (x - cxw))) }; });
      ascendN = Array.from({ length: 5 }, (_, i) => { const x = w * (0.18 + 0.64 * R(i + 200)); return { x, baseY: limb(x), phase: R(i + 210), spd: 0.10 + R(i + 220) * 0.08 }; });
    }

    function draw() {
      const pr = progress.current, t = frame / 60;
      ctx!.clearRect(0, 0, w, h);

      const cloudA = 1 - smooth(0.34, 0.6, pr);
      const explode = smooth(0.34, 0.78, pr);
      const skyA = smooth(0.58, 0.92, pr);

      // sky / atmosphere — curved Earth limb seen from space
      if (skyA > 0) {
        const apex = earth.apex;
        // deep-space → atmosphere wash above the limb
        const g = ctx!.createLinearGradient(0, apex, 0, apex - h * 0.6);
        g.addColorStop(0, `rgba(46,139,255,${0.42 * skyA})`);
        g.addColorStop(0.5, `rgba(40,110,200,${0.12 * skyA})`);
        g.addColorStop(1, "rgba(1,2,7,0)");
        ctx!.fillStyle = g; ctx!.fillRect(0, 0, w, apex + 2);

        // ── aurora light-beams rising off the limb (ArcAuraFX vibe)
        ctx!.save(); ctx!.filter = "blur(18px)";
        for (let i = 0; i < 8; i++) {
          const bx = w * (0.1 + 0.8 * (i / 7)) + Math.sin(t * 0.4 + i * 1.7) * 26;
          const flick = 0.45 + 0.55 * Math.sin(t * 0.7 + i * 1.3);
          const bw2 = w * 0.075;
          const bg = ctx!.createLinearGradient(0, apex, 0, apex - h * 0.5);
          bg.addColorStop(0, `rgba(130,205,255,${0.18 * skyA * flick})`);
          bg.addColorStop(0.5, `rgba(46,139,255,${0.08 * skyA * flick})`);
          bg.addColorStop(1, "rgba(46,139,255,0)");
          ctx!.fillStyle = bg; ctx!.fillRect(bx - bw2 / 2, apex - h * 0.5, bw2, h * 0.5);
        }
        ctx!.filter = "none"; ctx!.restore();

        // planet body below the limb (the curving Earth)
        ctx!.beginPath(); ctx!.moveTo(0, h + 2);
        for (let x = 0; x <= w; x += w / 48) ctx!.lineTo(x, limb(x));
        ctx!.lineTo(w, h + 2); ctx!.closePath();
        const pg = ctx!.createLinearGradient(0, apex, 0, h);
        pg.addColorStop(0, `rgba(26,52,86,${0.92 * skyA})`);
        pg.addColorStop(0.5, `rgba(10,24,46,${0.95 * skyA})`);
        pg.addColorStop(1, `rgba(2,6,16,${skyA})`);
        ctx!.fillStyle = pg; ctx!.fill();

        // atmospheric rim glow tracing the limb
        const strokeLimb = () => { ctx!.beginPath(); for (let x = 0; x <= w; x += w / 48) { const y = limb(x); if (x === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y); } ctx!.stroke(); };
        ctx!.save(); ctx!.filter = "blur(9px)";
        ctx!.strokeStyle = `rgba(120,205,255,${0.55 * skyA})`; ctx!.lineWidth = 7; strokeLimb();
        ctx!.filter = "none"; ctx!.restore();
        ctx!.strokeStyle = `rgba(190,230,255,${0.85 * skyA})`; ctx!.lineWidth = 1.6; strokeLimb();
      }

      // stars (brighten as the cloud clears)
      const starA = 0.35 + 0.65 * skyA;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        ctx!.fillStyle = `rgba(220,230,245,${(0.3 + 0.5 * Math.abs(Math.sin(t + s.tw))) * starA})`;
        ctx!.beginPath(); ctx!.arc(s.x, s.y, s.r, 0, 6.28); ctx!.fill();
      }

      // ── extraction: users feeding data INTO the cloud (sharecropping)
      if (cloudA > 0.02) {
        const cx = w * 0.5, cy = h * 0.52;
        for (let i = 0; i < users.length; i++) {
          const u = users[i];
          ctx!.strokeStyle = `rgba(120,140,160,${0.16 * cloudA})`; ctx!.lineWidth = 0.7;
          ctx!.beginPath(); ctx!.moveTo(u.x, u.y); ctx!.lineTo(cx, cy + h * 0.05); ctx!.stroke();
          ctx!.fillStyle = `rgba(150,170,190,${0.5 * cloudA})`;
          ctx!.beginPath(); ctx!.arc(u.x, u.y, 2, 0, 6.28); ctx!.fill();
          // packet siphoned upward into the cloud
          const tt = (t * 0.4 + i * 0.13) % 1;
          ctx!.fillStyle = `rgba(224,86,106,${0.8 * cloudA})`;
          ctx!.beginPath(); ctx!.arc(u.x + (cx - u.x) * tt, u.y + (cy + h * 0.05 - u.y) * tt, 1.6, 0, 6.28); ctx!.fill();
        }
        // heat / emissions glow beneath the cloud (environmental harm)
        const hg = ctx!.createRadialGradient(cx, cy + h * 0.12, 0, cx, cy + h * 0.12, w * 0.26);
        hg.addColorStop(0, `rgba(255,90,60,${0.22 * cloudA})`);
        hg.addColorStop(1, "rgba(255,90,60,0)");
        ctx!.fillStyle = hg; ctx!.fillRect(0, 0, w, h);
        for (let i = 0; i < heat.length; i++) {
          const e = heat[i]; const ry = (t * e.v * 60 + e.s * h) % (h * 0.4);
          ctx!.fillStyle = `rgba(255,${120 + e.s * 80},70,${0.18 * cloudA * (1 - ry / (h * 0.4))})`;
          ctx!.beginPath(); ctx!.arc(e.x + Math.sin(t + i) * 6, e.y - ry, 1.6, 0, 6.28); ctx!.fill();
        }
      }

      // ── cloud infrastructure: a datacenter of server racks, dissolving apart
      for (let i = 0; i < racks.length; i++) {
        const k = racks[i];
        const a = cloudA; if (a < 0.01) continue;
        const x = k.x + k.dx * explode * w * 0.5 + Math.sin(t * 0.3 + i) * 2;
        const y = k.y + k.dy * explode * h * 0.32 - explode * h * 0.12;
        ctx!.save();
        ctx!.translate(x + k.w / 2, y + k.h / 2);
        ctx!.rotate(explode * (k.seed - 0.5) * 1.8);
        const rw = k.w, rh = k.h;
        // chassis (cold metal)
        ctx!.fillStyle = `rgba(22,28,38,${0.94 * a})`;
        ctx!.strokeStyle = `rgba(110,130,155,${0.45 * a})`;
        ctx!.lineWidth = 1;
        ctx!.beginPath(); ctx!.rect(-rw / 2, -rh / 2, rw, rh); ctx!.fill(); ctx!.stroke();
        // server-unit LEDs: mostly blue compute, occasional red (heat / extraction)
        for (let g = 0; g < 3; g++) {
          const ly = -rh / 2 + rh * (g + 0.5) / 3;
          for (let d = 0; d < 3; d++) {
            const lx = -rw / 2 + 5 + d * 5;
            const blink = Math.sin(t * 3 + i * 0.7 + g + d) > 0.1;
            const red = (i + g + d) % 7 === 0;
            ctx!.fillStyle = red
              ? `rgba(255,90,70,${(blink ? 0.95 : 0.3) * a})`
              : `rgba(91,200,255,${(blink ? 0.9 : 0.22) * a})`;
            ctx!.fillRect(lx, ly - 0.9, 2.4, 1.8);
          }
        }
        ctx!.restore();
      }

      // ── the world mesh: sovereign nodes spread around the curved world
      if (skyA > 0.02) {
        const link = (a: { x: number; y: number }, b: { x: number; y: number }, lift: number) => {
          ctx!.strokeStyle = `rgba(91,200,255,${0.24 * skyA})`; ctx!.lineWidth = 0.8;
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - lift;
          ctx!.beginPath(); ctx!.moveTo(a.x, a.y); ctx!.quadraticCurveTo(mx, my, b.x, b.y); ctx!.stroke();
          const tt = (t * 0.5 + a.x * 0.0013) % 1;
          const qx = (1 - tt) * (1 - tt) * a.x + 2 * (1 - tt) * tt * mx + tt * tt * b.x;
          const qy = (1 - tt) * (1 - tt) * a.y + 2 * (1 - tt) * tt * my + tt * tt * b.y;
          ctx!.fillStyle = `rgba(150,220,255,${0.9 * skyA})`;
          ctx!.beginPath(); ctx!.arc(qx, qy, 1.5, 0, 6.28); ctx!.fill();
        };
        // peer-to-peer surface links (no centre) + a few longer hops
        for (let i = 0; i < surfN.length - 1; i++) { link(surfN[i], surfN[i + 1], 18); if (i % 2 === 0 && i < surfN.length - 2) link(surfN[i], surfN[i + 2], 30); }
        for (let i = 0; i < orbitN.length - 1; i++) link(orbitN[i], orbitN[i + 1], 26);
        for (let i = 0; i < orbitN.length; i++) link(orbitN[i], surfN[Math.round(i * (surfN.length - 1) / (orbitN.length - 1))], 14);

        // ascending nodes — rising into the stratosphere & beyond (limitless)
        for (let i = 0; i < ascendN.length; i++) {
          const aN = ascendN[i]; const prog = (t * aN.spd + aN.phase) % 1; const ay = aN.baseY - prog * h * 0.82; const af = (1 - prog) * skyA;
          const tg = ctx!.createLinearGradient(0, ay, 0, ay + h * 0.16);
          tg.addColorStop(0, "rgba(150,220,255,0)"); tg.addColorStop(1, `rgba(120,200,255,${0.28 * af})`);
          ctx!.strokeStyle = tg; ctx!.lineWidth = 1; ctx!.beginPath(); ctx!.moveTo(aN.x, ay); ctx!.lineTo(aN.x, ay + h * 0.16); ctx!.stroke();
          ctx!.fillStyle = `rgba(185,228,255,${0.95 * af})`; ctx!.beginPath(); ctx!.arc(aN.x, ay, 1.8, 0, 6.28); ctx!.fill();
        }

        // transparent sovereign nodes
        const drawNode = (n: { x: number; y: number }, r: number) => {
          ctx!.fillStyle = `rgba(46,139,255,${0.14 * skyA})`; ctx!.beginPath(); ctx!.arc(n.x, n.y, r * 2.2, 0, 6.28); ctx!.fill();
          ctx!.strokeStyle = `rgba(120,200,255,${0.85 * skyA})`; ctx!.lineWidth = 1; ctx!.beginPath(); ctx!.arc(n.x, n.y, r, 0, 6.28); ctx!.stroke();
        };
        orbitN.forEach((n) => drawNode(n, 3));
        surfN.forEach((n) => drawNode(n, 4));
      }

      frame++;
      raf = requestAnimationFrame(draw);
    }
    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  const cloudCopy = 1 - smooth(0.28, 0.5, p);
  const skyCopy = smooth(0.66, 0.9, p);

  return (
    <section ref={wrap} className="relative h-[300vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(110% 80% at 50% 30%, transparent 40%, rgba(1,2,7,0.5) 80%, var(--color-void) 100%)" }} />

        {/* the cloud message */}
        <div className="absolute inset-x-0 top-[19%] flex justify-center px-6 text-center" style={{ opacity: cloudCopy }}>
          <div className="max-w-2xl">
            <p className="kicker" style={{ color: "#e0566a" }}>The extractive cloud</p>
            <h2 className="t-section mt-5">
              Your intelligence runs in <span style={{ color: "#e0566a" }}>someone else&apos;s cloud</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[color:var(--color-ink-dim)] leading-relaxed">
              They meter it, mine your data as rent, and burn a planet&apos;s worth of power to keep
              the harvest running. Sharecropping, with a server bill.
            </p>
          </div>
        </div>

        {/* the sky message */}
        <div className="absolute inset-x-0 top-[19%] flex justify-center px-6 text-center"
             style={{ opacity: skyCopy, pointerEvents: skyCopy > 0.5 ? "auto" : "none" }}>
          <div className="max-w-2xl">
            <p className="kicker">The Atmosphere</p>
            <h2 className="t-section mt-5">
              Then the cloud clears — and the <span className="aurora-text">sky was always yours</span>.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-[color:var(--color-ink-dim)] leading-relaxed">
              Sovereign nodes, meshed peer-to-peer across the whole world. No landlord, no meter,
              no harvest. Just your compute, in the open air.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
