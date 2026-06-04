"use client";
import { useRef, useEffect, useState, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import Typewriter from "@/components/Typewriter";

const SIGNAL = new THREE.Color("#2e8bff");
const QUANTUM = new THREE.Color("#5bc8ff");

// Ordered by willingness-to-pay for sovereign, compliant AI — highest-value
// regulated verticals first, widening to the broad builder audiences.
const HERO_AUDIENCES = [
  "AI agents", "healthcare", "finance", "legal teams", "defense & gov",
  "biotech & pharma", "insurance", "critical infrastructure", "enterprises", "developers",
];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

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
  const { camera } = useThree();

  // ── a globe of connected nodes (fibonacci sphere surface + faint inner shell) ──
  const { points, colors, lines } = useMemo(() => {
    const R = 4.5;
    const N = 720;
    const raw: THREE.Vector3[] = [];
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) {
      const inner = i % 5 === 0;                 // ~20% form a faint inner shell for depth
      const rr = (inner ? 3.05 : R) + (Math.random() - 0.5) * 0.18;
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
    return { points: pos, colors: col, lines: new Float32Array(seg) };
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

    // camera flies from far → up to just OUTSIDE the front node (never inside the
    // globe, so the node reads as a clean cross-section rather than a line jumble)
    camPos.set(0, 0.45 * dive, 12).lerp(new THREE.Vector3(0, 0.45, 8.0), dive);
    camera.position.copy(camPos);
    lookAt.set(0, 0, 0).lerp(NODE, smooth(0.3, 0.82, p));
    camera.lookAt(lookAt);

    // the sovereign node — bright from the start, opens as we arrive
    const pulse = 1 + Math.sin(t * 1.7) * 0.08;
    sov.current.scale.setScalar(pulse * (0.32 + dive * 0.3));
    (sov.current.material as THREE.MeshBasicMaterial).opacity = 1 - open * 0.92;
    halo.current.scale.setScalar(pulse * (0.9 + dive * 0.9));
    (halo.current.material as THREE.MeshBasicMaterial).opacity = (0.22 + dive * 0.12) * (1 - open * 0.45);

    // globe fades out completely as the node fills the frame
    const fade = 1 - smooth(0.58, 0.86, p);
    ptsMat.current.opacity = fade;
    lineMat.current.opacity = 0.42 * fade;

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
  const progress = useRef(0);
  const [p, setP] = useState(0);
  const [allow3D, setAllow3D] = useState(false);

  // Only mount the WebGL dive on capable desktops. Mobile/touch Safari crashes
  // ("a problem repeatedly occurred") under this scene's GPU/memory load, so those
  // devices get the fast static hero below instead. SSR renders the static hero.
  useEffect(() => {
    const capable =
      typeof window !== "undefined" &&
      window.innerWidth >= 1024 &&
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setAllow3D(capable);
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
          <p className="kicker">Sovereign&nbsp;AI&nbsp;Infrastructure</p>
          <h1 className="display mt-5 text-[clamp(2.3rem,10.5vw,3.6rem)] leading-[1.06]">
            The sovereign<br />internet for<br />
            <Typewriter className="aurora-text" words={HERO_AUDIENCES} />
          </h1>
          <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-[color:var(--color-ink-dim)]">
            StratosAgent runs on your own metal — meshed peer-to-peer with{" "}
            <span className="text-[color:var(--color-ink)]">no open ports</span>,{" "}
            <span className="text-[color:var(--color-ink)]">post-quantum-sealed</span>, and able to{" "}
            <span className="text-[color:var(--color-ink)]">see, hear, and speak</span>. No cloud. No landlord. No meter.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a href="#install" className="btn-signal w-full justify-center sm:w-auto">Install now<span aria-hidden>→</span></a>
            <a href="#atmosphere" className="btn-ghost w-full justify-center sm:w-auto">Enter the Atmosphere</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={wrap} className="relative h-[340vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* aurora blooms behind the canvas */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-[6%] top-[26%] h-[40rem] w-[40rem] rounded-full opacity-[0.20] blur-[130px]"
               style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
          <div className="absolute right-[4%] top-[12%] h-[36rem] w-[36rem] rounded-full opacity-[0.18] blur-[140px]"
               style={{ background: "radial-gradient(circle, var(--color-quantum), transparent 62%)" }} />
        </div>

        <Canvas camera={{ position: [0, 0, 12], fov: 55 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
          <Field progress={progress} />
        </Canvas>

        {/* seat the type */}
        <div aria-hidden className="pointer-events-none absolute inset-0"
             style={{ background: "radial-gradient(120% 90% at 30% 50%, transparent 30%, rgba(6,7,10,0.5) 74%, var(--color-void) 100%)" }} />

        {/* hero copy — fades as the dive begins */}
        <div className="absolute inset-0 flex items-center" style={{ opacity: heroFade, transition: "opacity 0.1s linear", pointerEvents: heroFade > 0.5 ? "auto" : "none" }}>
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-3xl">
              <p className="kicker">Sovereign&nbsp;AI&nbsp;Infrastructure</p>
              <h1 className="display mt-6 text-[clamp(2.6rem,7.2vw,6.2rem)]">
                The sovereign<br />internet for<br />
                <Typewriter className="aurora-text" words={HERO_AUDIENCES} />
              </h1>
              <p className="mt-7 max-w-xl text-[clamp(1.02rem,1.4vw,1.22rem)] leading-relaxed text-[color:var(--color-ink-dim)]">
                StratosAgent runs on your own metal — meshed peer-to-peer with{" "}
                <span className="text-[color:var(--color-ink)]">no open ports</span>,{" "}
                <span className="text-[color:var(--color-ink)]">post-quantum-sealed</span>, and able to{" "}
                <span className="text-[color:var(--color-ink)]">see, hear, and speak</span>. No cloud. No landlord. No meter.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <a href="#install" className="btn-signal">Install now<span aria-hidden>→</span></a>
                <a href="#atmosphere" className="btn-ghost">Enter the Atmosphere</a>
              </div>
            </div>
          </div>
        </div>

        {/* layer legend — fades in as the node opens */}
        <div className="absolute inset-0 flex items-center" style={{ opacity: layersFade, pointerEvents: layersFade > 0.5 ? "auto" : "none" }}>
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-md">
              <p className="kicker">Inside one sovereign node</p>
              <h2 className="display mt-5 text-[clamp(1.6rem,3.4vw,2.6rem)] text-[color:var(--color-ink)]">
                Six layers, <span className="aurora-text">end to end</span>.
              </h2>
              <ul className="mt-7 space-y-3">
                {LAYER_LABELS.map(([id, name, desc], i) => {
                  const c = SIGNAL.clone().lerp(QUANTUM, i / 5).getStyle();
                  return (
                    <li key={id} className="flex items-start gap-3"
                        style={{ opacity: smooth(0.7 + i * 0.02, 0.88 + i * 0.015, p) }}>
                      <span className="mono mt-0.5 text-[12px]" style={{ color: c }}>{id}</span>
                      <span className="mt-0.5 h-px w-6 shrink-0" style={{ background: c, opacity: 0.5, marginTop: 9 }} />
                      <span>
                        <span className="block text-[14px] text-[color:var(--color-ink)]">{name}</span>
                        <span className="block text-[12px] text-[color:var(--color-ink-faint)]">{desc}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
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
