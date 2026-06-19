"use client";
import { useEffect, useRef, useState } from "react";

/* ============================================================================
   THE ARCHITECTURE — a pinned, scroll-driven sequence through the seven layers
   we actually built. Each layer gets a DISTINCT 3D visualization (perspective-
   projected in Canvas-2D so it runs on phones too, where WebGL crashes), a
   brief claim-safe explanation, and an honest maturity badge.

   Base state (SSR / no-JS / reduced motion) = clean stacked glass cards, so the
   copy is always in the DOM. Enhanced state = the immersive pinned canvas.
   Names + one-liners are verbatim from PRODUCT_ARCHITECTURE_V2 (canon).
   ========================================================================== */

type Tone = "prod" | "enforced" | "measured";
const TONE: Record<Tone, { hex: string; label: string }> = {
  prod: { hex: "#3ddc97", label: "Production" },
  enforced: { hex: "#8b5cf6", label: "Enforced" },
  measured: { hex: "#22d3ee", label: "Measured" },
};

type Layer = {
  n: string;
  name: string;
  role: string;
  status: string;
  tone: Tone;
  blurb: string;
};

const LAYERS: Layer[] = [
  {
    n: "01", name: "Atmos", role: "The environment", status: "PRODUCTION", tone: "prod",
    blurb: "Your owned environment for agents, models, files, workflows, receipts, terminal access and governance — the file system is the source of truth.",
  },
  {
    n: "02", name: "ECP", role: "The context", status: "PRODUCTION", tone: "prod",
    blurb: "The filesystem becomes the agent architecture — manifests make it machine-readable, the compiler loadable, ledgers compaction-proof, receipts provable.",
  },
  {
    n: "03", name: "StratosAgent", role: "The runtime", status: "PRODUCTION", tone: "prod",
    blurb: "Governed hands for AI agents: CLI, terminal, tools, workflows, receipts, safe execution boundaries. Free forever, open source.",
  },
  {
    n: "04", name: "Governance Harness", role: "The authority", status: "ENFORCED", tone: "enforced",
    blurb: "Every action bounded by authority, permissions, approvals and protected-action gates — deny-by-default, the denial audited.",
  },
  {
    n: "05", name: "Receipts", role: "The proof", status: "PRODUCTION", tone: "prod",
    blurb: "Signed, hash-chained evidence for autonomous work. Not “trust me” — verify it with a public key, in your browser.",
  },
  {
    n: "06", name: "ARI", role: "The readiness", status: "MEASURED", tone: "measured",
    blurb: "Owned, governed, verifiable, cost-aware, continuous, ready for autonomy? The runtime score is live; the full 12-dimension index renders honest-null where not yet instrumented.",
  },
  {
    n: "07", name: "DOP", role: "The metabolism", status: "MEASURED", tone: "measured",
    blurb: "Records outcomes, evaluates work, promotes what proves value, prunes what decays — humans keep control of evolution.",
  },
];
const N = LAYERS.length;

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const rng = (s: number) => {
  const x = Math.sin(s * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function ArchitectureSequence() {
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const [immersive, setImmersive] = useState(false);

  // Upgrade to the immersive canvas only when JS + motion are available.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setImmersive(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Scroll progress across the pinned section (Lenis-friendly, same idiom as the
  // rest of the site — no ScrollTrigger needed).
  useEffect(() => {
    if (!immersive) return;
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
  }, [immersive]);

  // The renderer — one Canvas-2D loop, dispatching to a distinct 3D motif per
  // layer, cross-fading at band boundaries. Only the active (and adjacent during
  // a hand-off) motif draws, so cost stays bounded on phones.
  useEffect(() => {
    if (!immersive) return;
    const canvas = cv.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, frame = 0, mobile = false;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      mobile = w < 768;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // ── perspective projection (rotate Y, tilt X, project) ──
    const FOCAL = 5.4;
    const proj = (x: number, y: number, z: number, rotY: number, tilt: number) => {
      const cY = Math.cos(rotY), sY = Math.sin(rotY);
      const X = x * cY - z * sY;
      const Zr = x * sY + z * cY;
      const cX = Math.cos(tilt), sX = Math.sin(tilt);
      const Y = y * cX - Zr * sX;
      const Z = y * sX + Zr * cX;
      const pp = FOCAL / (FOCAL + Z);
      return { x: X * pp, y: Y * pp, p: pp, z: Z };
    };

    const dot = (sx: number, sy: number, r: number, col: string, a: number) => {
      ctx.globalAlpha = a;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, 6.283);
      ctx.fill();
    };
    const glowDot = (sx: number, sy: number, r: number, col: string, a: number) => {
      ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 4);
      g.addColorStop(0, col);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(sx, sy, r * 4, 0, 6.283);
      ctx.fill();
    };
    const line = (
      x1: number, y1: number, x2: number, y2: number, col: string, a: number, lw = 1,
    ) => {
      ctx.globalAlpha = a;
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const SKY = "#7cc4ff";
    const RED = "#ff5a5a";

    // shared stage transform per motif
    const stage = () => {
      const cx = mobile ? w * 0.5 : w * 0.66;
      const cy = mobile ? h * 0.38 : h * 0.52;
      const scale = (mobile ? Math.min(w, h) * 0.4 : Math.min(w, h) * 0.36);
      return { cx, cy, scale };
    };

    // ── motif drawers (idx 0..6) ──────────────────────────────────────────
    // 1 · ATMOS — a 3D file-tree lattice (filesystem = source of truth)
    const tree = (() => {
      const nodes: { x: number; y: number; z: number; d: number }[] = [];
      const edges: [number, number][] = [];
      const add = (x: number, y: number, z: number, d: number, parent: number) => {
        const i = nodes.length;
        nodes.push({ x, y, z, d });
        if (parent >= 0) edges.push([parent, i]);
        return i;
      };
      const root = add(0, 1.35, 0, 0, -1);
      const branch = (parent: number, d: number, ang: number, spread: number, len: number) => {
        if (d > 3) return;
        const kids = d === 0 ? 4 : 2;
        for (let k = 0; k < kids; k++) {
          const a = ang + (k - (kids - 1) / 2) * spread + (rng(parent * 7 + k + d) - 0.5) * 0.3;
          const px = nodes[parent].x, py = nodes[parent].y, pz = nodes[parent].z;
          const nx = px + Math.cos(a) * len;
          const ny = py - len * 0.62;
          const nz = pz + Math.sin(a) * len;
          const id = add(nx, ny, nz, d + 1, parent);
          branch(id, d + 1, a, spread * 0.7, len * 0.72);
        }
      };
      branch(root, 0, 0, 1.7, 1.05);
      return { nodes, edges, maxD: 4 };
    })();
    const drawAtmos = (a: number, t: number, lt: number, col: string) => {
      const { cx, cy, scale } = stage();
      const rotY = t * 0.18;
      const tilt = 0.32;
      const reveal = (n: { d: number }) => smooth(n.d / 5 - 0.02, n.d / 5 + 0.28, lt + 0.12);
      ctx.save();
      tree.edges.forEach(([i, j]) => {
        const A = tree.nodes[i], B = tree.nodes[j];
        const r = Math.min(reveal(A), reveal(B));
        if (r <= 0.02) return;
        const pa = proj(A.x, A.y, A.z, rotY, tilt);
        const pb = proj(B.x, B.y, B.z, rotY, tilt);
        line(cx + pa.x * scale, cy + pa.y * scale, cx + pb.x * scale, cy + pb.y * scale,
          col, 0.32 * a * r, 1);
      });
      tree.nodes.forEach((n, i) => {
        const r = reveal(n);
        if (r <= 0.02) return;
        const pr = proj(n.x, n.y, n.z, rotY, tilt);
        const sx = cx + pr.x * scale, sy = cy + pr.y * scale;
        const rad = (n.d === 0 ? 4.5 : 3 - n.d * 0.3) * pr.p;
        if (n.d === 0) glowDot(sx, sy, rad, col, 0.5 * a * r);
        dot(sx, sy, Math.max(0.8, rad), n.d === 0 ? col : SKY, (0.5 + 0.4 * pr.p) * a * r);
        // a data pulse climbing the tree
        if (i % 3 === 0) {
          const ph = (t * 0.5 + i * 0.21) % 1;
          dot(sx, sy - ph * 4, 1.4 * pr.p, col, (1 - ph) * a * r * 0.8);
        }
      });
      ctx.restore();
    };

    // 2 · ECP — scattered docs crystallizing into a machine-loadable lattice
    const ecp = Array.from({ length: mobile ? 80 : 150 }, (_, i) => {
      const gx = (i % 5) - 2, gy = Math.floor((i / 5) % 6) - 2.5, gz = Math.floor(i / 30) - 2;
      return {
        sx: (rng(i + 1) - 0.5) * 4.4, sy: (rng(i + 9) - 0.5) * 4.4, sz: (rng(i + 5) - 0.5) * 4.4,
        gx: gx * 0.62, gy: gy * 0.46, gz: gz * 0.62,
      };
    });
    const drawEcp = (a: number, t: number, lt: number, col: string) => {
      const { cx, cy, scale } = stage();
      const rotY = t * 0.16;
      const tilt = 0.3;
      const k = smooth(0.05, 0.78, lt);
      const e = k * k * (3 - 2 * k);
      const pts = ecp.map((q) => {
        const x = q.sx + (q.gx - q.sx) * e;
        const y = q.sy + (q.gy - q.sy) * e;
        const z = q.sz + (q.gz - q.sz) * e;
        const pr = proj(x, y, z, rotY, tilt);
        return { sx: cx + pr.x * scale, sy: cy + pr.y * scale, p: pr.p };
      });
      // lattice lines appear as it locks into the grid
      if (e > 0.5) {
        for (let i = 0; i < pts.length; i++) {
          if ((i + 1) % 5 !== 0 && i + 1 < pts.length)
            line(pts[i].sx, pts[i].sy, pts[i + 1].sx, pts[i + 1].sy, col, 0.16 * a * (e - 0.5) * 2, 0.8);
        }
      }
      pts.forEach((q) => {
        dot(q.sx, q.sy, Math.max(0.7, 1.7 * q.p), e > 0.7 ? col : SKY, (0.35 + 0.5 * q.p) * a);
      });
    };

    // 3 · STRATOSAGENT — a terminal core with governed tool-arms executing
    const drawStratos = (a: number, t: number, lt: number, col: string) => {
      const { cx, cy, scale } = stage();
      const rotY = t * 0.3;
      const tilt = 0.34;
      // central cube (the runtime)
      const C = 0.5;
      const cube = [
        [-C, -C, -C], [C, -C, -C], [C, C, -C], [-C, C, -C],
        [-C, -C, C], [C, -C, C], [C, C, C], [-C, C, C],
      ].map(([x, y, z]) => proj(x, y, z, rotY, tilt));
      const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
      E.forEach(([i, j]) =>
        line(cx + cube[i].x * scale, cy + cube[i].y * scale, cx + cube[j].x * scale, cy + cube[j].y * scale, col, 0.6 * a, 1.2));
      glowDot(cx, cy, 9, col, 0.4 * a);
      // tool-arms reaching out to orbiting tool-nodes; pulses run outward = execution
      const arms = 6;
      for (let i = 0; i < arms; i++) {
        const aa = (i / arms) * 6.283 + t * 0.25;
        const tx = Math.cos(aa) * 1.7, tz = Math.sin(aa) * 1.7, ty = Math.sin(t * 0.6 + i) * 0.5;
        const pt = proj(tx, ty, tz, rotY, tilt);
        const ex = cx + pt.x * scale, ey = cy + pt.y * scale;
        const reveal = smooth(i / arms - 0.1, i / arms + 0.2, lt);
        line(cx, cy, ex, ey, SKY, 0.25 * a * reveal, 1);
        dot(ex, ey, 2.6 * pt.p, col, 0.85 * a * reveal);
        const ph = (t * 0.7 + i * 0.4) % 1;
        dot(cx + (ex - cx) * ph, cy + (ey - cy) * ph, 1.8, col, (1 - ph) * a * reveal);
      }
    };

    // 4 · GOVERNANCE — a gate/membrane: intent passes only when approved
    const gov = Array.from({ length: mobile ? 26 : 44 }, (_, i) => ({
      y: (rng(i + 2) - 0.5) * 2.4, x: (rng(i + 7) - 0.5) * 2.4,
      allow: rng(i + 3) > 0.32, off: rng(i + 11),
    }));
    const drawGov = (a: number, t: number, lt: number, col: string) => {
      const { cx, cy, scale } = stage();
      const rotY = 0.5 + Math.sin(t * 0.15) * 0.12;
      const tilt = 0.18;
      // the gate ring (a circle standing in the x/y plane at z=0)
      const ring = 40;
      ctx.globalAlpha = a;
      for (let i = 0; i < ring; i++) {
        const a1 = (i / ring) * 6.283, a2 = ((i + 1) / ring) * 6.283;
        const p1 = proj(Math.cos(a1) * 0.98, Math.sin(a1) * 0.98, 0, rotY, tilt);
        const p2 = proj(Math.cos(a2) * 0.98, Math.sin(a2) * 0.98, 0, rotY, tilt);
        line(cx + p1.x * scale, cy + p1.y * scale, cx + p2.x * scale, cy + p2.y * scale, col, 0.5 * a, 1.4);
      }
      glowDot(cx, cy, 16, col, 0.16 * a);
      // particles travelling along +z toward the gate; allowed pass, denied reflect red
      gov.forEach((q, i) => {
        const cyc = (t * 0.32 + q.off) % 1;
        let z: number, c: string, al: number;
        if (q.allow) {
          z = -2.4 + cyc * 4.8; // straight through
          c = cyc > 0.5 ? "#3ddc97" : SKY;
          al = 1;
        } else {
          // approach to gate (z=0) then bounce back
          const half = cyc < 0.5 ? cyc * 2 : 1 - (cyc - 0.5) * 2;
          z = -2.4 + half * 2.4;
          c = cyc < 0.5 ? SKY : RED;
          al = cyc < 0.5 ? 1 : 1 - (cyc - 0.5) * 1.4;
        }
        const reveal = smooth(i / gov.length - 0.1, i / gov.length + 0.25, lt + 0.2);
        const pr = proj(q.x, q.y, z, rotY, tilt);
        dot(cx + pr.x * scale, cy + pr.y * scale, Math.max(0.8, 2.2 * pr.p), c, 0.9 * a * al * reveal);
      });
    };

    // 5 · RECEIPTS — a hash-chain of signed blocks, a verify pulse sweeping it
    const drawReceipts = (a: number, t: number, lt: number, col: string) => {
      const { cx, cy, scale } = stage();
      const rotY = -0.5 + Math.sin(t * 0.12) * 0.08;
      const tilt = 0.28;
      const M = 6;
      const blocks: { c: { x: number; y: number; p: number }[]; mid: { x: number; y: number; p: number } }[] = [];
      const s = 0.34;
      for (let b = 0; b < M; b++) {
        const reveal = smooth(b / M - 0.05, b / M + 0.2, lt);
        if (reveal <= 0.02) continue;
        const ox = (b - (M - 1) / 2) * 0.92;
        const oz = (b - (M - 1) / 2) * 0.55;
        const corners = [
          [-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s],
          [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s],
        ].map(([x, y, z]) => proj(ox + x, y, oz + z, rotY, tilt));
        const E = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
        const sweep = smooth(b / M - 0.12, b / M + 0.04, (t * 0.22) % 1.2);
        const c = sweep > 0.5 ? "#3ddc97" : col;
        E.forEach(([i, j]) =>
          line(cx + corners[i].x * scale, cy + corners[i].y * scale, cx + corners[j].x * scale, cy + corners[j].y * scale, c, 0.55 * a * reveal, 1));
        const midp = proj(ox, 0, oz, rotY, tilt);
        blocks.push({ c: corners, mid: { x: cx + midp.x * scale, y: cy + midp.y * scale, p: midp.p } });
        if (sweep > 0.5 && sweep < 0.9) glowDot(cx + midp.x * scale, cy + midp.y * scale, 8, "#3ddc97", 0.5 * a);
      }
      // chain links between block centres
      for (let b = 1; b < blocks.length; b++)
        line(blocks[b - 1].mid.x, blocks[b - 1].mid.y, blocks[b].mid.x, blocks[b].mid.y, SKY, 0.4 * a, 1);
    };

    // 6 · ARI — a 12-spoke readiness instrument; 6 measured (lit), rest honest-null
    const drawAri = (a: number, t: number, lt: number, col: string) => {
      const { cx, cy, scale } = stage();
      const rotY = t * 0.12;
      const tilt = 0.9; // looking down on the dial
      // concentric rings
      [0.5, 0.85, 1.2].forEach((rr) => {
        const seg = 48;
        for (let i = 0; i < seg; i++) {
          const a1 = (i / seg) * 6.283, a2 = ((i + 1) / seg) * 6.283;
          const p1 = proj(Math.cos(a1) * rr, 0, Math.sin(a1) * rr, rotY, tilt);
          const p2 = proj(Math.cos(a2) * rr, 0, Math.sin(a2) * rr, rotY, tilt);
          line(cx + p1.x * scale, cy + p1.y * scale, cx + p2.x * scale, cy + p2.y * scale, "#2b3b54", 0.5 * a, 1);
        }
      });
      const spokes = 12;
      const sweepA = (t * 0.5) % 6.283;
      for (let i = 0; i < spokes; i++) {
        const aa = (i / spokes) * 6.283;
        const measured = i % 2 === 0; // 6 of 12 live
        const reveal = smooth(i / spokes - 0.05, i / spokes + 0.18, lt);
        const len = measured ? 1.2 : 0.55;
        const p0 = proj(0, 0, 0, rotY, tilt);
        const p1 = proj(Math.cos(aa) * len, 0, Math.sin(aa) * len, rotY, tilt);
        const c = measured ? col : "#3a4a63";
        line(cx + p0.x * scale, cy + p0.y * scale, cx + p1.x * scale, cy + p1.y * scale, c, (measured ? 0.7 : 0.4) * a * reveal, measured ? 1.6 : 1);
        const tip = proj(Math.cos(aa) * len, 0, Math.sin(aa) * len, rotY, tilt);
        dot(cx + tip.x * scale, cy + tip.y * scale, measured ? 2.6 : 1.6, c, 0.9 * a * reveal);
      }
      // radar sweep
      const sp = proj(Math.cos(sweepA) * 1.2, 0, Math.sin(sweepA) * 1.2, rotY, tilt);
      const cc = proj(0, 0, 0, rotY, tilt);
      line(cx + cc.x * scale, cy + cc.y * scale, cx + sp.x * scale, cy + sp.y * scale, "#3ddc97", 0.5 * a, 1.5);
      glowDot(cx + cc.x * scale, cy + cc.y * scale, 7, col, 0.4 * a);
    };

    // 7 · DOP — cells; promoted ones divide and glow, pruned ones fade away
    const cells = Array.from({ length: mobile ? 14 : 22 }, (_, i) => ({
      x: (rng(i + 3) - 0.5) * 2.6, y: (rng(i + 8) - 0.5) * 2.2, z: (rng(i + 1) - 0.5) * 2.2,
      promoted: rng(i + 6) > 0.45, off: rng(i + 4),
    }));
    const drawDop = (a: number, t: number, lt: number, col: string) => {
      const { cx, cy, scale } = stage();
      const rotY = t * 0.14;
      const tilt = 0.32;
      cells.forEach((q, i) => {
        const cyc = (t * 0.25 + q.off) % 1;
        const reveal = smooth(i / cells.length - 0.05, i / cells.length + 0.2, lt + 0.2);
        const pr = proj(q.x, q.y, q.z, rotY, tilt);
        const sx = cx + pr.x * scale, sy = cy + pr.y * scale;
        if (q.promoted) {
          // grow, then split into two glowing children
          const split = smooth(0.45, 0.75, cyc);
          const r = (2.4 + cyc * 1.6) * pr.p;
          glowDot(sx, sy, r, "#3ddc97", 0.4 * a * reveal);
          dot(sx - split * 6, sy, r * 0.7, "#3ddc97", 0.9 * a * reveal);
          dot(sx + split * 6, sy, r * 0.7, "#3ddc97", 0.9 * a * reveal);
        } else {
          // pruned — shrink and fade out
          const fade = 1 - smooth(0.4, 0.9, cyc);
          dot(sx, sy, Math.max(0.5, 2.4 * pr.p * fade), RED, 0.7 * a * reveal * fade);
        }
      });
      glowDot(cx, cy, 12, col, 0.1 * a);
    };

    const DRAW = [drawAtmos, drawEcp, drawStratos, drawGov, drawReceipts, drawAri, drawDop];

    const render = () => {
      const pr = progress.current;
      const t = frame / 60;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const fp = clamp01(pr) * N;
      const idx = Math.min(N - 1, Math.floor(fp));
      const frac = fp - idx;
      const fade = idx < N - 1 ? smooth(0.82, 1.0, frac) : 0;
      const col = TONE[LAYERS[idx].tone].hex;

      DRAW[idx](1 - fade, t, frac, col);
      if (fade > 0) DRAW[idx + 1](fade, t, smooth(0.82, 1.0, frac) * 0.2, TONE[LAYERS[idx + 1].tone].hex);

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      frame++;
      raf = requestAnimationFrame(render);
    };
    resize();
    render();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [immersive]);

  // ── derived UI state for the DOM foreground ──
  const fp = clamp01(p) * N;
  const idx = Math.min(N - 1, Math.floor(fp));
  const frac = fp - idx;
  const fade = idx < N - 1 ? smooth(0.82, 1.0, frac) : 0;
  const activeRail = fade > 0.5 ? idx + 1 : idx;

  // ── BASE STATE: stacked glass cards (SSR / no-JS / reduced motion) ──
  if (!immersive) {
    return (
      <section className="section section-t">
        <div className="mx-auto max-w-6xl px-5">
          <p className="kicker">The architecture</p>
          <h2 className="t-section mt-4 max-w-3xl">
            Seven layers. <span className="aurora-text">One environment you own.</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {LAYERS.map((l) => (
              <div key={l.n} className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">{l.n}</span>
                  <span className="mono inline-flex items-center gap-1.5 text-[11px] tracking-[0.08em]"
                        style={{ color: TONE[l.tone].hex }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE[l.tone].hex }} />
                    {l.status}
                  </span>
                </div>
                <h3 className="t-card-title mt-3">{l.name}</h3>
                <p className="mono mt-1 text-[12px] uppercase tracking-[0.14em] text-[color:var(--color-ink-faint)]">{l.role}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">{l.blurb}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── IMMERSIVE STATE: pinned canvas + cross-faded glass panels ──
  return (
    <section ref={wrap} className="relative" style={{ height: `${(N + 1) * 100}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas ref={cv} className="absolute inset-0 h-full w-full" />
        {/* vignette to seat the type */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(120% 90% at 60% 50%, transparent 30%, rgba(6,8,14,0.55) 78%, var(--color-void) 100%)" }} />

        {/* persistent header */}
        <div className="pointer-events-none absolute inset-x-0 top-[12vh] mx-auto max-w-6xl px-5 md:top-[14vh]">
          <p className="kicker">The architecture</p>
          <h2 className="t-section mt-3 max-w-md md:max-w-lg">
            Seven layers. <span className="aurora-text">One environment you own.</span>
          </h2>
        </div>

        {/* left progress rail (desktop) — compact: index + growing tick only,
            so it never collides with the panel; the panel names the active layer */}
        <div className="pointer-events-none absolute left-6 top-1/2 hidden -translate-y-1/2 flex-col gap-3.5 md:flex">
          {LAYERS.map((l, i) => {
            const on = i === activeRail;
            return (
              <div key={l.n} className="flex items-center gap-2.5" style={{ opacity: on ? 1 : 0.45, transition: "opacity 0.3s" }}>
                <span className="mono text-[11px]" style={{ color: on ? TONE[l.tone].hex : "var(--color-ink-faint)" }}>{l.n}</span>
                <span className="h-px transition-all duration-300" style={{ width: on ? 26 : 10, background: on ? TONE[l.tone].hex : "var(--color-ink-faint)" }} />
              </div>
            );
          })}
        </div>

        {/* the layer panels — cross-faded */}
        {LAYERS.map((l, i) => {
          const op = i === idx ? 1 - fade : i === idx + 1 ? fade : 0;
          if (op <= 0.01) return null;
          return (
            <div key={l.n}
                 className="absolute inset-x-0 bottom-[8vh] px-5 md:bottom-auto md:left-24 md:top-1/2 md:max-w-md md:-translate-y-1/2 md:px-0"
                 style={{ opacity: op, pointerEvents: op > 0.5 ? "auto" : "none" }}>
              <div className="glass mx-auto max-w-md rounded-2xl p-6 md:mx-0">
                <div className="flex items-center justify-between">
                  <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">{l.n} / 07</span>
                  <span className="mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] tracking-[0.1em]"
                        style={{ color: TONE[l.tone].hex, background: `color-mix(in oklab, ${TONE[l.tone].hex} 14%, transparent)` }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE[l.tone].hex }} />
                    {l.status}
                  </span>
                </div>
                <h3 className="t-card-title mt-3 text-[1.75rem]">{l.name}</h3>
                <p className="mono mt-1 text-[12px] uppercase tracking-[0.16em]" style={{ color: TONE[l.tone].hex }}>{l.role}</p>
                <p className="mt-4 text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">{l.blurb}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
