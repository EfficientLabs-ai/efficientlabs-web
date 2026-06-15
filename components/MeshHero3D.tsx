"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import TypewriterHeading, { type TwSeg } from "@/components/motion/TypewriterHeading";
import { HERO_READY_EVENT } from "@/lib/motion";

// The hero title, typed out — "Own" and "acts from" carry the aurora accent.
const HERO_TITLE: TwSeg[] = [
  { text: "Own", accent: true },
  { text: " the environment" },
  { break: true },
  { text: "your AI " },
  { text: "acts from", accent: true },
  { text: "." },
];

const SIGNAL = new THREE.Color("#0a84ff");
const QUANTUM = new THREE.Color("#3d6cff");

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const seededRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};
const canUse3D = () =>
  typeof window !== "undefined" &&
  window.innerWidth >= 1024 &&
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// L0 (core) → L5 (surface), each with a one-line "what you get"
const LAYER_LABELS: [string, string, string][] = [
  ["L0", "Substrate · cryptography", "Post-quantum keys, sealed at rest"],
  ["L1", "Content & freshness", "SHA-256 addressing — never stale"],
  ["L2", "Transport · P2P mesh", "Hole-punched — no open ports"],
  ["L3", "Capability · isolation", "Least-privilege tokens, WASI sandbox"],
  ["L4", "Routing · inference", "Local-first, frontier on demand"],
  ["L5", "Agent surface · channels", "One agent, every inbox"],
];

// the node we dive into — sits at the front surface of the globe
const NODE = new THREE.Vector3(0, 0.45, 4.55);

type Prog = { current: number };

function Field({ progress }: { progress: Prog }) {
  const globe = useRef<THREE.Group>(null!);
  const ptsMat = useRef<THREE.PointsMaterial>(null!);
  const lineMat = useRef<THREE.LineBasicMaterial>(null!);
  const sov = useRef<THREE.Mesh>(null!);
  const halo = useRef<THREE.Mesh>(null!);
  const shells = useRef<THREE.Group>(null!);
  const starGroup = useRef<THREE.Group>(null!);
  const starsMat = useRef<THREE.PointsMaterial>(null!);
  const { camera } = useThree();

  // ── a globe of connected nodes (fibonacci sphere surface + faint inner shell) ──
  const { points, colors, lines, stars } = useMemo(() => {
    const R = 4.5;
    const N = 720;
    const raw: THREE.Vector3[] = [];
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const inner = i % 5 === 0;                 // ~20% form a faint inner shell for depth
      const rr = (inner ? 3.05 : R) + (seededRandom(i + 1) - 0.5) * 0.18;
      const y = 1 - (i / (N - 1)) * 2;
      const rad = Math.sqrt(Math.max(0, 1 - y * y));
      const th = i * golden;
      const x = Math.cos(th) * rad, z = Math.sin(th) * rad;
      const v = new THREE.Vector3(x * rr, y * rr, z * rr);
      raw.push(v);
      pos.set([v.x, v.y, v.z], i * 3);
      const c = SIGNAL.clone().lerp(QUANTUM, (y + 1) / 2);
      const b = inner ? 0.4 : 0.85;
      col.set([c.r * b, c.g * b, c.b * b], i * 3);
    }
    // geodesic edges: connect surface nodes to a few near neighbours
    const seg: number[] = [];
    const TH2 = 0.95 * 0.95;
    let count = 0;
    for (let i = 0; i < N && count < 1100; i++) {
      if (i % 5 === 0) continue;
      let made = 0;
      for (let j = i + 1; j < N && made < 3; j++) {
        if (j % 5 === 0) continue;
        if (raw[i].distanceToSquared(raw[j]) < TH2) {
          seg.push(raw[i].x, raw[i].y, raw[i].z, raw[j].x, raw[j].y, raw[j].z);
          made++; count++;
        }
      }
    }
    // a far depth field of faint stars — parallax behind the globe (adds real 3D depth)
    const SN = 520;
    const star = new Float32Array(SN * 3);
    for (let i = 0; i < SN; i++) {
      const rr = 16 + seededRandom(i * 3.13) * 20;
      const yy = 1 - (i / (SN - 1)) * 2;
      const radd = Math.sqrt(Math.max(0, 1 - yy * yy));
      const thh = i * golden * 1.7 + seededRandom(i * 0.7) * 6.28;
      star.set([Math.cos(thh) * radd * rr, yy * rr, Math.sin(thh) * radd * rr], i * 3);
    }
    return { points: pos, colors: col, lines: new Float32Array(seg), stars: star };
  }, []);

  const lookAt = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const p = progress.current;
    const t = state.clock.elapsedTime;
    const dive = smooth(0.32, 0.84, p);   // approach
    const open = smooth(0.6, 0.97, p);    // node opens into layers

    // globe rotates, then freezes as we commit to the dive
    globe.current.rotation.y = t * 0.045 * (1 - dive * 0.92) + p * 0.4;
    globe.current.rotation.x = Math.sin(t * 0.1) * 0.05 * (1 - dive);

    // CINEMATIC FRAMING (Cosmos): start farther back for vast negative space, and look
    // ABOVE origin so the luminous core sits LOWER-CENTER (room for the headline above it).
    // As the dive commits, the look pulls down to the node and we approach it.
    camPos.set(0, 0.45 * dive, 17.8).lerp(new THREE.Vector3(0, 0.45, 8.0), dive);
    camera.position.copy(camPos);
    // rest-state orbital sway — gives the scene life in time (the "4D" feel);
    // fades out as the dive commits so it never fights the scroll.
    const sway = 1 - dive;
    camera.position.x += Math.sin(t * 0.16) * 0.55 * sway;
    camera.position.y += Math.cos(t * 0.13) * 0.3 * sway;
    lookAt.set(0, 3.95, 0).lerp(NODE, smooth(0.3, 0.82, p));
    camera.lookAt(lookAt);

    // the sovereign node — luminous from the start (Cosmos: one bright object in the void),
    // opens as we arrive. Slightly larger core + brighter halo for that "powerful" read.
    const pulse = 1 + Math.sin(t * 1.7) * 0.07;
    sov.current.scale.setScalar(pulse * (0.42 + dive * 0.3));
    (sov.current.material as THREE.MeshBasicMaterial).opacity = 1 - open * 0.92;
    halo.current.scale.setScalar(pulse * (1.15 + dive * 0.9));
    (halo.current.material as THREE.MeshBasicMaterial).opacity = (0.3 + dive * 0.12) * (1 - open * 0.45);

    // globe fades out completely as the node fills the frame. Dimmed at rest so it reads as an
    // ambient field behind the headline (Cosmos calm), not a dense net competing with the type.
    const fade = 1 - smooth(0.58, 0.86, p);
    ptsMat.current.opacity = fade * 0.34;
    lineMat.current.opacity = 0.11 * fade;

    // far star depth-field — parallax slower than the globe, gentle twinkle,
    // recedes as the node opens so it never competes with the layer legend.
    starGroup.current.rotation.y = t * 0.012 + p * 0.12;
    starGroup.current.rotation.x = Math.sin(t * 0.05) * 0.03;
    starsMat.current.opacity = (0.5 + Math.sin(t * 0.8) * 0.12) * (0.35 + fade * 0.65);

    // nested shells L0→L5 reveal in sequence; counter-rotation = "alive"
    shells.current.scale.setScalar(1 + open * 0.08);
    shells.current.rotation.y = t * 0.12;
    shells.current.rotation.x = -0.32 + Math.sin(t * 0.2) * 0.05;
    shells.current.children.forEach((m, i) => {
      const mesh = m as THREE.Mesh;
      (mesh.material as THREE.MeshBasicMaterial).opacity =
        smooth(0.6 + i * 0.04, 0.8 + i * 0.03, p) * 0.6 * (1 - i * 0.05);
      mesh.rotation.y = t * 0.1 * (i % 2 ? 1 : -1.3);
      mesh.rotation.x = t * 0.07 * (i % 2 ? -1 : 1);
    });
  });

  return (
    <group>
      {/* far depth-field of faint stars — parallax behind everything */}
      <group ref={starGroup}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[stars, 3]} />
          </bufferGeometry>
          <pointsMaterial ref={starsMat} size={0.055} color="#9fb8ff" transparent
            opacity={0.5} sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
      </group>

      {/* the globe of connected nodes */}
      <group ref={globe}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[points, 3]} />
            <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          </bufferGeometry>
          <pointsMaterial ref={ptsMat} size={0.07} vertexColors transparent
            sizeAttenuation depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[lines, 3]} />
          </bufferGeometry>
          <lineBasicMaterial ref={lineMat} color={SIGNAL} transparent opacity={0.42}
            depthWrite={false} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>

      {/* the sovereign node + its internals, fixed at the globe's front surface */}
      <group position={[NODE.x, NODE.y, NODE.z]}>
        <mesh ref={sov}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color={SIGNAL} transparent opacity={1} depthWrite={false} />
        </mesh>
        <mesh ref={halo}>
          <sphereGeometry args={[1, 24, 24]} />
          <meshBasicMaterial color={SIGNAL} transparent opacity={0.2}
            blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>

        {/* L0→L5 — nested wireframe shells (a cross-section of the node) */}
        <group ref={shells}>
          {LAYER_LABELS.map(([id], i) => {
            const c = SIGNAL.clone().lerp(QUANTUM, i / 5);
            const r = 0.34 + i * 0.2;
            return (
              <mesh key={id}>
                <sphereGeometry args={[r, 16, 10]} />
                <meshBasicMaterial color={c} wireframe transparent opacity={0}
                  blending={THREE.AdditiveBlending} depthWrite={false} />
              </mesh>
            );
          })}
        </group>
      </group>
    </group>
  );
}

export default function MeshHero3D() {
  const wrap = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const [allow3D, setAllow3D] = useState(false);

  // Only mount the WebGL dive on capable desktops. Mobile/touch Safari crashes
  // ("a problem repeatedly occurred") under this scene's GPU/memory load, so those
  // devices get the fast static hero below instead. SSR renders the static hero.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const ok = canUse3D();
      setAllow3D(ok);
      // Static hero is ready the moment the decision lands; the WebGL path
      // signals from Canvas onCreated instead. The preloader races this
      // against its hard cap.
      if (!ok) window.dispatchEvent(new CustomEvent(HERO_READY_EVENT));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!allow3D) return;
    let raf = 0;
    const onScroll = () => {
      const el = wrap.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const v = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      progress.current = v;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setP(v));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, [allow3D]);

  // Barely-there cursor parallax on the aurora blooms (desktop + fine-pointer +
  // motion-ok only — gated identically to the WebGL dive). Pure transform, rAF-throttled.
  useEffect(() => {
    if (!allow3D) return;
    const el = auroraRef.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const dx = (e.clientX / window.innerWidth - 0.5) * 2;   // -1 … 1
      const dy = (e.clientY / window.innerHeight - 0.5) * 2;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // max ~4px drift — calm, lazy, never fights the scroll dive
        el.style.transform = `translate3d(${dx * 4}px, ${dy * 4}px, 0)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [allow3D]);

  const heroFade = 1 - smooth(0.14, 0.4, p);
  const layersFade = smooth(0.66, 0.92, p);

  // ── Mobile / touch / reduced-motion: fast static hero, NO WebGL (crash-safe) ──
  if (!allow3D) {
    return (
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-12%] top-[12%] h-[26rem] w-[26rem] rounded-full opacity-[0.22] blur-[100px]"
               style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
          <div className="absolute right-[-10%] top-[6%] h-[22rem] w-[22rem] rounded-full opacity-[0.18] blur-[110px]"
               style={{ background: "radial-gradient(circle, var(--color-quantum), transparent 62%)" }} />
          <div className="absolute inset-x-0 bottom-0 h-1/3"
               style={{ background: "linear-gradient(to top, var(--color-void), transparent)" }} />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-5 py-24">
          <p className="kicker">Governed intelligence infrastructure</p>
          <TypewriterHeading as="h1" segments={HERO_TITLE} className="t-display-sm mt-5 hyphens-none" />
          <p className="t-body-lg mt-6 max-w-xl text-[color:var(--color-ink-dim)]">
            Efficient Labs gives builders and organizations the infrastructure to run
            autonomous AI with ownership, governance, receipts, continuity, and human authority.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a href="/score" className="btn-signal w-full justify-center sm:w-auto">Run the Autonomous Readiness Index<span aria-hidden>→</span></a>
            <a href="/start" className="btn-outline w-full justify-center sm:w-auto">Start for free</a>
          </div>
          <p className="mt-5 max-w-md text-[13px] text-[color:var(--color-ink-faint)]">
            Not another AI wrapper. The ownership layer for verifiable autonomous work.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrap} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* aurora blooms behind the canvas — lazily parallax toward the cursor */}
        <div ref={auroraRef} aria-hidden className="hero-cursor-glow pointer-events-none absolute inset-0 will-change-transform"
             style={{ transition: "transform 0.5s cubic-bezier(0.2,0.8,0.2,1)" }}>
          <div className="absolute left-[6%] top-[26%] h-[40rem] w-[40rem] rounded-full opacity-[0.20] blur-[130px]"
               style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
          <div className="absolute right-[4%] top-[12%] h-[36rem] w-[36rem] rounded-full opacity-[0.18] blur-[140px]"
               style={{ background: "radial-gradient(circle, var(--color-quantum), transparent 62%)" }} />
        </div>

        <Canvas
          camera={{ position: [0, 0, 12], fov: 55 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          onCreated={() => window.dispatchEvent(new CustomEvent(HERO_READY_EVENT))}
        >
          <Field progress={progress} />
        </Canvas>

        {/* seat the type — clear void up top for the headline, the core glows up from lower-center */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(115% 75% at 50% 64%, transparent 26%, rgba(6,7,10,0.45) 64%, var(--color-void) 100%)" }} />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[50%]"
             style={{ background: "linear-gradient(to bottom, var(--color-void) 8%, rgba(6,7,10,0.86) 42%, transparent)" }} />

        {/* hero copy — CENTERED (Modal grammar), seated in the upper third, clears the fixed nav */}
        <div className="absolute inset-0 flex flex-col items-center" style={{ opacity: heroFade, transition: "opacity 0.1s linear", pointerEvents: heroFade > 0.5 ? "auto" : "none" }}>
          <div className="mx-auto w-full max-w-4xl px-6 pt-[17vh] text-center">
            <p className="kicker">Governed intelligence infrastructure</p>
            <TypewriterHeading as="h1" segments={HERO_TITLE} className="t-display mt-5" />
            <p className="t-body-lg mt-7 mx-auto max-w-2xl text-[color:var(--color-ink-dim)]">
              Efficient Labs gives builders and organizations the infrastructure to run
              autonomous AI with{" "}
              <span className="text-[color:var(--color-ink)]">ownership, governance, receipts,
              continuity, and human authority</span>.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <a href="/score" className="btn-signal">Run the Autonomous Readiness Index<span aria-hidden>→</span></a>
              <a href="/start" className="btn-outline">Start for free</a>
            </div>
            <p className="mt-6 mx-auto max-w-xl text-[13px] text-[color:var(--color-ink-faint)]">
              Not another AI wrapper. The ownership layer for verifiable autonomous work.
            </p>
          </div>
        </div>

        {/* node-opened payoff — the real layers live in the Architecture section below */}
        <div className="absolute inset-0 flex items-center" style={{ opacity: layersFade, pointerEvents: layersFade > 0.5 ? "auto" : "none" }}>
          <div className="mx-auto w-full max-w-3xl px-6 text-center">
            <p className="kicker">Inside one sovereign node</p>
            <h2 className="t-section mt-5">
              An environment <span className="aurora-text">you own</span> — end to end.
            </h2>
            <p className="mono mt-6 text-[12px] tracking-[0.24em] text-[color:var(--color-ink-faint)]">SEVEN LAYERS&nbsp;&nbsp;↓</p>
          </div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ opacity: 1 - smooth(0.04, 0.18, p) }}>
          <div className="flex flex-col items-center gap-2">
            <span className="mono text-[10px] tracking-[0.3em] text-[color:var(--color-ink-faint)]">DESCEND INTO A NODE</span>
            <span className="block h-9 w-px bg-gradient-to-b from-[color:var(--color-signal)] to-transparent"
                  style={{ animation: "scroll-cue 1.8s ease-in-out infinite" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
