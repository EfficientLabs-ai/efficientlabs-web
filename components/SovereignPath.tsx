"use client";
import { useEffect, useRef } from "react";
import { ActHeader, Reveal } from "@/components/Reveal";

/* ───────────────────────────────────────────────────────────────────────────
   Sovereign Path — the routing diagram.
   Left→right flow: prompts enter, the vast majority resolve on YOUR MACHINE
   (the aurora-glowing default). A rare ~1-in-8 pulse passes an opt-in GATE up to
   a dim, subordinate "frontier cloud" node. Honest to the real router: local by
   default; cloud only when you configure a key AND opt in; /private pins local.

   Canvas rAF scene (matches SkillSeal): DPR-aware, ResizeObserver, draws an
   immediate first frame, and renders a clean STATIC composition for
   prefers-reduced-motion (no motion, same nodes/branches/labels).
   GPU-cheap: canvas 2d only, no layout-property animation.
   ─────────────────────────────────────────────────────────────────────────── */

const SIGNAL = "46,139,255";   // electric azure — primary
const QUANTUM = "91,200,255";  // sky-cyan — pulse core
const DIM = "112,124,140";     // desaturated — the subordinate cloud

// normalized layout (0..1). Inflow on the left, LOCAL hero centre,
// CLOUD up-and-right and visually subordinate. Cloud is pulled inward on
// narrow canvases so its right-side labels stay in-bounds.
const ENTRY = [0.04, 0.62];
const LOCAL = [0.46, 0.62];
const GATE_W = [0.70, 0.40];  // opt-in gate (wide layout)
const CLOUD_W = [0.93, 0.22];
const GATE_N = [0.62, 0.42];  // narrow layout
const CLOUD_N = [0.80, 0.24];

// roughly 1 in 8 pulses take the gated cloud branch
const CLOUD_EVERY = 8;

export default function SovereignPath() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0;
    let afterResize: (() => void) | null = null;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      afterResize?.();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const X = (p: number[]) => p[0] * W;
    const Y = (p: number[]) => p[1] * H;
    const sm = () => W < 460; // compact label mode on narrow canvases
    const GATE = () => (sm() ? GATE_N : GATE_W);
    const CLOUD = () => (sm() ? CLOUD_N : CLOUD_W);

    // a pulse travels ENTRY→LOCAL; cloud-bound ones continue LOCAL→GATE→CLOUD
    type Pulse = { cloud: boolean; seg: number; t: number; resolved: number };
    let pulses: Pulse[] = [];
    let spawned = 0;
    let lastSpawn = 0;
    let localGlow = 0; // brightens each time a pulse resolves locally
    let gatePing = 0;  // brightens when a pulse clears the gate

    // helper: a point along the path of a pulse
    const pointAt = (p: Pulse): [number, number] => {
      if (!p.cloud) {
        const a = ENTRY, b = LOCAL;
        return [X(a) + (X(b) - X(a)) * p.t, Y(a) + (Y(b) - Y(a)) * p.t];
      }
      // cloud pulse: seg 0 ENTRY→LOCAL, seg 1 LOCAL→GATE, seg 2 GATE→CLOUD
      const legs = [[ENTRY, LOCAL], [LOCAL, GATE()], [GATE(), CLOUD()]];
      const [a, b] = legs[p.seg];
      return [X(a) + (X(b) - X(a)) * p.t, Y(a) + (Y(b) - Y(a)) * p.t];
    };

    const drawEdges = () => {
      // ENTRY → LOCAL (the alive default — bright)
      ctx.beginPath();
      ctx.moveTo(X(ENTRY), Y(ENTRY)); ctx.lineTo(X(LOCAL), Y(LOCAL));
      ctx.strokeStyle = `rgba(${SIGNAL},0.34)`; ctx.lineWidth = 1.4; ctx.stroke();

      // LOCAL → GATE → CLOUD (the subordinate, gated branch — dim + dashed)
      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.beginPath();
      ctx.moveTo(X(LOCAL), Y(LOCAL)); ctx.lineTo(X(GATE()), Y(GATE())); ctx.lineTo(X(CLOUD()), Y(CLOUD()));
      ctx.strokeStyle = `rgba(${DIM},0.4)`; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
    };

    const drawGate = () => {
      const gx = X(GATE()), gy = Y(GATE());
      const lit = gatePing;
      // small lock / opt-in marker straddling the branch
      ctx.beginPath(); ctx.arc(gx, gy, 9, 0, Math.PI * 2);
      ctx.fillStyle = "#05070b"; ctx.fill();
      ctx.strokeStyle = `rgba(${DIM},${0.55 + lit * 0.4})`; ctx.lineWidth = 1.2; ctx.stroke();
      // lock body
      ctx.fillStyle = `rgba(${DIM},${0.75 + lit * 0.25})`;
      ctx.fillRect(gx - 3, gy - 0.5, 6, 5);
      // shackle
      ctx.beginPath(); ctx.arc(gx, gy - 0.5, 2.6, Math.PI, 0); ctx.lineWidth = 1.1;
      ctx.strokeStyle = `rgba(${DIM},${0.75 + lit * 0.25})`; ctx.stroke();
    };

    const drawCloud = () => {
      const cx = X(CLOUD()), cy = Y(CLOUD());
      // dim, desaturated, subordinate — a ceiling, not the hero
      ctx.beginPath(); ctx.arc(cx, cy, sm() ? 9 : 11, 0, Math.PI * 2);
      ctx.fillStyle = "#05070b"; ctx.fill();
      ctx.strokeStyle = `rgba(${DIM},0.65)`; ctx.lineWidth = 1.3; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${DIM},0.8)`; ctx.fill();
    };

    const drawLocal = () => {
      const lx = X(LOCAL), ly = Y(LOCAL);
      const t = reduce ? 0.5 : (Math.sin(performance.now() / 620) + 1) / 2;
      const pulseBoost = localGlow;
      // aurora halo — the only glow in the scene, reserved for the sovereign node
      const haloR = (sm() ? 30 : 42) + t * 6 + pulseBoost * 14;
      const halo = ctx.createRadialGradient(lx, ly, 0, lx, ly, haloR);
      halo.addColorStop(0, `rgba(${QUANTUM},${0.22 + pulseBoost * 0.3})`);
      halo.addColorStop(0.5, `rgba(${SIGNAL},${0.14 + pulseBoost * 0.18})`);
      halo.addColorStop(1, `rgba(${SIGNAL},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath(); ctx.arc(lx, ly, haloR, 0, Math.PI * 2); ctx.fill();
      // breathing ring
      ctx.strokeStyle = `rgba(${SIGNAL},${0.25 + t * 0.25})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(lx, ly, (sm() ? 18 : 22) + t * 4, 0, Math.PI * 2); ctx.stroke();
      // core
      const cr = sm() ? 11 : 14;
      ctx.beginPath(); ctx.arc(lx, ly, cr + pulseBoost * 3, 0, Math.PI * 2);
      ctx.fillStyle = "#05070b"; ctx.fill();
      ctx.strokeStyle = `rgba(${SIGNAL},${0.7 + pulseBoost * 0.3})`; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, ly, sm() ? 4 : 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${QUANTUM},${0.85 + pulseBoost * 0.15})`; ctx.fill();
    };

    const drawPulse = (px: number, py: number, dim: boolean) => {
      const col = dim ? DIM : QUANTUM;
      const g = ctx.createRadialGradient(px, py, 0, px, py, 8);
      g.addColorStop(0, `rgba(${col},0.9)`);
      g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = `rgba(${col},1)`;
      ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill();
    };

    const drawLabels = () => {
      const f = sm() ? 8.5 : 10;
      ctx.font = `${f}px ui-monospace, monospace`;
      ctx.textAlign = "left";

      // inflow label
      ctx.fillStyle = `rgba(${SIGNAL},0.8)`;
      ctx.fillText("your prompts →", X(ENTRY) + 2, Y(ENTRY) - 14);

      // LOCAL — the default destination
      ctx.textAlign = "center";
      ctx.fillStyle = "#dbe6f3";
      ctx.font = `${sm() ? 10 : 12}px ui-monospace, monospace`;
      ctx.fillText("Your machine", X(LOCAL), Y(LOCAL) + (sm() ? 34 : 42));
      ctx.font = `${f}px ui-monospace, monospace`;
      ctx.fillStyle = `rgba(${SIGNAL},0.78)`;
      ctx.fillText("local-first · the default", X(LOCAL), Y(LOCAL) + (sm() ? 47 : 57));
      ctx.fillStyle = "rgba(155,167,182,0.85)";
      ctx.fillText("/private → never leaves", X(LOCAL), Y(LOCAL) + (sm() ? 59 : 71));

      // GATE label
      ctx.font = `${f}px ui-monospace, monospace`;
      ctx.textAlign = sm() ? "right" : "left";
      ctx.fillStyle = "rgba(155,167,182,0.7)";
      ctx.fillText("opt-in gate", X(GATE()) + (sm() ? -14 : 12), Y(GATE()) + (sm() ? 2 : 4));

      // CLOUD — subordinate. On narrow canvases right-align the labels to the
      // canvas edge so they never clip; on wide canvases they sit left of the node.
      const cx = X(CLOUD()), cy = Y(CLOUD());
      ctx.textAlign = sm() ? "right" : "right";
      const lblX = sm() ? W - 6 : cx - 16;
      ctx.fillStyle = `rgba(${DIM},0.95)`;
      ctx.font = `${sm() ? 9.5 : 11}px ui-monospace, monospace`;
      ctx.fillText("Frontier cloud", lblX, cy + (sm() ? 26 : -2));
      ctx.font = `${f}px ui-monospace, monospace`;
      ctx.fillStyle = "rgba(122,134,150,0.75)";
      ctx.fillText("only when you opt in", lblX, cy + (sm() ? 38 : 11));
      ctx.fillText("needs your key", lblX, cy + (sm() ? 49 : 22));

      // illustrative tally (NOT telemetry) — bottom-left
      ctx.textAlign = "left";
      ctx.font = `${sm() ? 8.5 : 9.5}px ui-monospace, monospace`;
      ctx.fillStyle = `rgba(${SIGNAL},0.7)`;
      ctx.fillText("≈90% local", 4, H - 16);
      ctx.fillStyle = "rgba(122,134,150,0.7)";
      ctx.fillText("≈10% opt-in cloud", 4, H - 4);
      ctx.fillStyle = "rgba(90,101,118,0.7)";
      const tallyW = ctx.measureText("≈10% opt-in cloud").width;
      ctx.fillText("· illustrative, not measured", 4 + tallyW + 8, H - 4);
    };

    const render = () => {
      ctx.clearRect(0, 0, W, H);
      drawEdges();
      drawGate();
      drawCloud();
      drawLocal();
      drawLabels();
    };

    if (reduce) {
      // STATIC frame: a representative still — one pulse mid-flow to local,
      // one having cleared the gate toward cloud. No motion. Redraws on resize
      // so it never ends up blank if layout settles after mount.
      const drawStatic = () => {
        if (W === 0 || H === 0) return;
        render();
        const a = [X(ENTRY) + (X(LOCAL) - X(ENTRY)) * 0.55, Y(ENTRY) + (Y(LOCAL) - Y(ENTRY)) * 0.55];
        drawPulse(a[0], a[1], false);
        const b = [X(GATE()) + (X(CLOUD()) - X(GATE())) * 0.5, Y(GATE()) + (Y(CLOUD()) - Y(GATE())) * 0.5];
        drawPulse(b[0], b[1], true);
      };
      afterResize = drawStatic;
      drawStatic();
      return () => { ro.disconnect(); afterResize = null; };
    }

    let raf = 0;
    const loop = (now: number) => {
      // spawn a new pulse on a steady cadence
      if (now - lastSpawn > 560) {
        lastSpawn = now;
        spawned += 1;
        const cloud = spawned % CLOUD_EVERY === 0;
        pulses.push({ cloud, seg: 0, t: 0, resolved: 0 });
      }

      // advance
      localGlow *= 0.9;
      gatePing *= 0.9;
      pulses.forEach((p) => {
        p.t += 0.02;
        if (p.t >= 1) {
          if (!p.cloud) {
            // resolved locally — satisfying pulse, then fade (return)
            localGlow = 1;
            p.resolved = Math.max(p.resolved, 1);
            p.t = 1;
          } else if (p.seg < 2) {
            if (p.seg === 1) gatePing = 1; // cleared the gate
            p.seg += 1; p.t = 0;
          } else {
            p.resolved = 1; p.t = 1;
          }
        }
      });
      // fade resolved local pulses out (the satisfying return), then cull
      pulses = pulses.filter((p) => {
        if (p.resolved && !p.cloud) { p.resolved += 0.05; return p.resolved < 1.6; }
        if (p.resolved && p.cloud) { p.resolved += 0.04; return p.resolved < 1.5; }
        return true;
      });

      render();

      // pulses on top of nodes
      pulses.forEach((p) => {
        const [px, py] = pointAt(p);
        const fading = p.resolved > 1;
        ctx.save();
        if (fading) ctx.globalAlpha = Math.max(0, 1 - (p.resolved - 1) / 0.6);
        drawPulse(px, py, p.cloud && p.seg === 2);
        ctx.restore();
      });

      raf = requestAnimationFrame(loop);
    };
    render();                 // immediate first frame (no blank flash)
    raf = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="grid items-center gap-14 lg:grid-cols-2">
      <div>
        <ActHeader
          index="→"
          kicker="Routing"
          title={<>Local by default. <span className="aurora-text">Cloud only if you say so.</span></>}
        >
          The router we ship resolves your work on your own machine first. A frontier
          model is reached for only when you&apos;ve configured a key{" "}
          <span className="text-[color:var(--color-ink)]">and</span> opted in — and a{" "}
          <span className="mono text-[color:var(--color-ink)]">/private</span> request never
          leaves your metal at all. The cloud is the rare exception, not the path.
        </ActHeader>
      </div>

      <Reveal delay={0.1}>
        <div className="lm-card p-4">
          <canvas
            ref={ref}
            className="block h-[300px] w-full sm:h-[320px]"
            aria-label="Routing diagram: your prompts resolve on your own machine by default; only about one in ten pulses passes an opt-in gate to a dim, subordinate frontier-cloud node. Percentages are illustrative, not measured telemetry."
          />
        </div>
      </Reveal>
    </div>
  );
}
