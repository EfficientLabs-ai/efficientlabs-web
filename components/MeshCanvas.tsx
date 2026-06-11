"use client";
import { useEffect, useRef } from "react";

/**
 * The living mesh — a generative proximity-graph of sovereign nodes.
 * Edges draw themselves between near nodes (aurora-graded cyan→violet across x),
 * content-addressed packets travel the edges, and one bright "sovereign node"
 * pulses at the focus. Mouse parallax. Canvas 2D for reliability + 60fps.
 * (The scroll-driven dive-into-layers / r3f upgrade lands in a later pass.)
 */
export default function MeshCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, frame = 0;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const LINK = 158;

    type Node = { x: number; y: number; vx: number; vy: number; r: number; sov?: boolean };
    let nodes: Node[] = [];
    type Packet = { a: number; b: number; t: number; speed: number };
    const packets: Packet[] = [];

    const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

    function resize() {
      w = canvas!.clientWidth; h = canvas!.clientHeight;
      canvas!.width = Math.floor(w * dpr); canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(28, Math.min(96, Math.floor((w * h) / 13500)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.3 + 0.6,
      }));
      nodes[0] = { x: w * 0.32, y: h * 0.54, vx: 0, vy: 0, r: 3.2, sov: true };
    }

    function spawnPacket() {
      const a = (Math.random() * nodes.length) | 0;
      const b = (Math.random() * nodes.length) | 0;
      if (a !== b) packets.push({ a, b, t: 0, speed: 0.004 + Math.random() * 0.006 });
      if (packets.length > 16) packets.shift();
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      const px = (mouse.x - 0.5) * 34, py = (mouse.y - 0.5) * 34;

      for (const n of nodes) {
        if (n.sov) continue;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const o = 1 - d / LINK;
            const m = ((a.x + b.x) / 2) / w;
            ctx!.strokeStyle = `rgba(${lerp(46, 91, m)},${lerp(139, 200, m)},${lerp(255, 255, m)},${o * 0.2})`;
            ctx!.lineWidth = 0.7;
            ctx!.beginPath();
            ctx!.moveTo(a.x + px, a.y + py);
            ctx!.lineTo(b.x + px, b.y + py);
            ctx!.stroke();
          }
        }
      }

      if (!reduce && frame % 26 === 0) spawnPacket();
      for (const p of packets) {
        p.t += p.speed; if (p.t > 1) p.t = 0;
        const a = nodes[p.a], b = nodes[p.b];
        if (!a || !b) continue;
        const x = a.x + (b.x - a.x) * p.t + px, y = a.y + (b.y - a.y) * p.t + py;
        ctx!.fillStyle = "rgba(46,139,255,0.16)";
        ctx!.beginPath(); ctx!.arc(x, y, 5, 0, Math.PI * 2); ctx!.fill();
        ctx!.fillStyle = "rgba(46,139,255,0.95)";
        ctx!.beginPath(); ctx!.arc(x, y, 1.6, 0, Math.PI * 2); ctx!.fill();
      }

      for (const n of nodes) {
        if (n.sov) {
          const pulse = 1 + Math.sin(frame * 0.05) * 0.22;
          ctx!.fillStyle = "rgba(46,139,255,0.10)";
          ctx!.beginPath(); ctx!.arc(n.x + px, n.y + py, 20 * pulse, 0, Math.PI * 2); ctx!.fill();
          ctx!.strokeStyle = "rgba(46,139,255,0.55)"; ctx!.lineWidth = 1;
          ctx!.beginPath(); ctx!.arc(n.x + px, n.y + py, 9, 0, Math.PI * 2); ctx!.stroke();
          ctx!.fillStyle = "#0a84ff";
          ctx!.beginPath(); ctx!.arc(n.x + px, n.y + py, 3.2, 0, Math.PI * 2); ctx!.fill();
        } else {
          ctx!.fillStyle = "rgba(154,166,180,0.5)";
          ctx!.beginPath(); ctx!.arc(n.x + px, n.y + py, n.r, 0, Math.PI * 2); ctx!.fill();
        }
      }

      frame++;
      raf = requestAnimationFrame(draw);
    }

    const onMove = (e: MouseEvent) => { mouse.tx = e.clientX / window.innerWidth; mouse.ty = e.clientY / window.innerHeight; };

    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMove); };
  }, []);

  return <canvas ref={ref} aria-hidden className="absolute inset-0 h-full w-full" />;
}
