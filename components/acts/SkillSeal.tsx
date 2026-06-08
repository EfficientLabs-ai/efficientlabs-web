"use client";
import { useEffect, useRef } from "react";
import { ActHeader, Reveal } from "@/components/Reveal";

// normalized node layout (x,y in 0..1) — origin seals, peers gossip
const NODES = [
  [0.10, 0.50], // 0 origin
  [0.32, 0.22], // 1
  [0.32, 0.78], // 2
  [0.54, 0.50], // 3 hub
  [0.74, 0.26], // 4
  [0.74, 0.74], // 5
  [0.92, 0.50], // 6
];
const EDGES = [[0,1],[0,2],[1,3],[2,3],[1,2],[3,4],[3,5],[4,6],[5,6]];
const INTRUDER = [1.04, 0.5]; // enters from the right, aims at node 6

// adjacency for the gossip walk
const ADJ: number[][] = NODES.map((_, n) =>
  EDGES.flatMap(([a, b]) => (a === n ? [b] : b === n ? [a] : []))
);

const SIGNAL = "46,139,255";
const QUANTUM = "91,200,255";
const REJECT = "224,86,106";

export default function SkillSeal() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const px = (i: number) => NODES[i][0] * W;
    const py = (i: number) => NODES[i][1] * H;
    const hit = new Float32Array(NODES.length); // last-pinged intensity per node

    type Pkt = { from: number; to: number; t: number; hops: number };
    let pkts: Pkt[] = [];
    let lastSpawn = 0;

    // intruder rejection cycle (ms)
    const CYCLE = 4200;

    const start = performance.now();
    let raf = 0;

    const draw = (now: number) => {
      const el = now - start;
      ctx.clearRect(0, 0, W, H);

      // edges
      EDGES.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(px(a), py(a)); ctx.lineTo(px(b), py(b));
        ctx.strokeStyle = `rgba(${SIGNAL},0.16)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // spawn gossip packets from origin
      if (!reduce && now - lastSpawn > 520) {
        lastSpawn = now;
        const to = ADJ[0][Math.floor((el / 520) % ADJ[0].length)];
        pkts.push({ from: 0, to, t: 0, hops: 0 });
      }

      // advance + draw packets
      pkts = pkts.filter((p) => p.hops < 7);
      pkts.forEach((p) => {
        p.t += 0.022;
        if (p.t >= 1) {
          hit[p.to] = 1;
          const opts = ADJ[p.to].filter((n) => n !== p.from);
          const next = opts.length ? opts[(p.hops + p.to) % opts.length] : p.from;
          p.from = p.to; p.to = next; p.t = 0; p.hops += 1;
        }
        const x = px(p.from) + (px(p.to) - px(p.from)) * p.t;
        const y = py(p.from) + (py(p.to) - py(p.from)) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, `rgba(${QUANTUM},0.95)`);
        g.addColorStop(1, `rgba(${QUANTUM},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${QUANTUM},1)`;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      });

      // nodes
      NODES.forEach((_, i) => {
        const origin = i === 0;
        hit[i] *= 0.94;
        const r = origin ? 9 : 6;
        const glow = 0.25 + hit[i] * 0.75;
        if (origin) {
          const t = (Math.sin(el / 600) + 1) / 2;
          ctx.strokeStyle = `rgba(${SIGNAL},${0.15 + t * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px(i), py(i), 16 + t * 4, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(px(i), py(i), r + hit[i] * 5, 0, Math.PI * 2);
        ctx.fillStyle = "#06070a"; ctx.fill();
        ctx.strokeStyle = `rgba(${SIGNAL},${glow})`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(px(i), py(i), origin ? 3.4 : 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${QUANTUM},${0.7 + hit[i] * 0.3})`; ctx.fill();
      });

      // sealed label
      ctx.font = "9px ui-monospace, monospace";
      ctx.fillStyle = `rgba(${SIGNAL},0.85)`;
      ctx.fillText("ml-dsa sealed", px(0) - 8, py(0) - 22);

      // ── intruder rejection cycle ──
      if (!reduce) {
        const phase = (el % CYCLE) / CYCLE; // 0..1
        const ix = INTRUDER[0] * W, iy = INTRUDER[1] * H;
        const target = 6;
        if (phase < 0.86) {
          // approach: 0..0.45 move in, edge reaches; 0.45..0.6 verify; 0.6..0.86 reject
          const approach = Math.min(1, phase / 0.42);
          const cx2 = ix + (px(target) - ix) * approach * 0.55;
          const cy2 = iy + (py(target) - iy) * approach * 0.55;
          const rejecting = phase > 0.55;
          const col = rejecting ? REJECT : "200,120,90";
          // tentative edge toward the network (dashed)
          ctx.save();
          ctx.setLineDash([3, 4]);
          ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(px(target), py(target));
          ctx.strokeStyle = `rgba(${col},${rejecting ? 0.7 * (1 - (phase - 0.55) / 0.31) : 0.5})`;
          ctx.lineWidth = 1.2; ctx.stroke();
          ctx.restore();
          // intruder node
          ctx.beginPath(); ctx.arc(cx2, cy2, 6, 0, Math.PI * 2);
          ctx.fillStyle = "#06070a"; ctx.fill();
          ctx.strokeStyle = `rgba(${col},0.95)`; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath(); ctx.arc(cx2, cy2, 2.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col},1)`; ctx.fill();
          // verdict label + ✕
          ctx.font = "9px ui-monospace, monospace";
          if (rejecting) {
            ctx.fillStyle = `rgba(${REJECT},1)`;
            ctx.fillText("seal ✕ rejected", cx2 + 12, cy2 + 4);
            // X glyph
            ctx.strokeStyle = `rgba(${REJECT},0.9)`; ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(cx2 - 4, cy2 - 4); ctx.lineTo(cx2 + 4, cy2 + 4);
            ctx.moveTo(cx2 + 4, cy2 - 4); ctx.lineTo(cx2 - 4, cy2 + 4);
            ctx.stroke();
          } else {
            ctx.fillStyle = `rgba(200,160,120,0.8)`;
            ctx.fillText("verifying seal…", cx2 + 12, cy2 + 4);
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };
    draw(performance.now()); // paint an immediate first frame, then animate

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="grid items-center gap-14 lg:grid-cols-2">
      <div>
        <ActHeader index="04" kicker="Sealed skills · gossip" title={<>Trust travels with the <span className="aurora-text">seal</span>.</>}>
          A skill is sealed once at its origin with a post-quantum ML-DSA signature, then gossips
          peer-to-peer across the mesh. Every node verifies the seal against the content address
          before it accepts — so a tampered copy is <span className="text-[color:var(--color-ink)]">rejected on
          arrival</span>, no matter who relayed it. No central registry. No package server to poison.
        </ActHeader>
      </div>

      <Reveal delay={0.1}>
        <div className="lm-card p-4">
          <canvas ref={ref} className="block h-[280px] w-full" aria-label="Live: sealed skills gossip across the mesh; a tampered node is rejected on arrival" />
        </div>
      </Reveal>
    </div>
  );
}
