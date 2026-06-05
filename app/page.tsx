import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MeshHero3D from "@/components/MeshHero3D";
import AtmosphereReveal from "@/components/acts/AtmosphereReveal";
import StratosAgent from "@/components/StratosAgent";
import Solutions from "@/components/Solutions";
import Differentiators from "@/components/Differentiators";
import Install from "@/components/Install";
import ContentAddress from "@/components/acts/ContentAddress";
import HolePunch from "@/components/acts/HolePunch";
import Capability from "@/components/acts/Capability";
import SkillSeal from "@/components/acts/SkillSeal";
import StatusMatrix from "@/components/acts/StatusMatrix";
import type { Metadata } from "next";

// Only override the canonical; inherit the root openGraph (image/title/desc) intact.
// In App Router a child `openGraph` REPLACES the parent's rather than deep-merging.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="relative">
      <Nav />

      {/* ── CINEMATIC HERO — scroll dives the camera into a node ── */}
      <MeshHero3D />

      {/* ── THE ATMOSPHERE — extractive cloud dissolves into the sky ── */}
      <section id="atmosphere">
        <AtmosphereReveal />
      </section>

      {/* ── WHY IT'S DIFFERENT — mesh / seal / senses ─────────── */}
      <Differentiators />

      {/* ── THESIS STRIP ──────────────────────────────────────── */}
      <section id="architecture" className="section section-t relative">
        <div className="container-x grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="kicker">The thesis</p>
            <h2 className="t-section mt-5">
              Automate the <span className="aurora-text">file architecture</span>, not the AI wrapper.
            </h2>
            <p className="mt-6 text-[color:var(--color-ink-dim)] leading-relaxed">
              Agents are expensive, non-reproducible glue. A correctly-designed file and
              dataflow architecture does the work deterministically, cheaply, and auditably —
              and the agent earns its place only where genuine ambiguity lives. The sections
              below don&apos;t describe the architecture. They run it.
            </p>
            <ul className="mt-7 grid grid-cols-3 gap-4">
              {[["Deterministic", "same input, same output"], ["Auditable", "every step inspectable"], ["Cheap", "glue work, not tokens"]].map(([h, d]) => (
                <li key={h}>
                  <p className="mono text-[13px] font-semibold text-[color:var(--color-ink)]">{h}</p>
                  <p className="mt-0.5 text-[12px] text-[color:var(--color-ink-faint)]">{d}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lm-card overflow-hidden p-1.5">
            <video
              className="w-full rounded-[var(--radius)]"
              src="/video/thesis-architecture.mp4"
              poster="/img/thesis-architecture.png"
              autoPlay muted loop playsInline preload="metadata"
              aria-label="Software file-architecture rendered as luminous living infrastructure — data flowing through glowing directory modules and brushed-chrome conduits"
            />
          </div>
        </div>
      </section>

      {/* ── STRATOSAGENT — the agent, above the cloud ─────────── */}
      <StratosAgent />

      {/* ── SOLUTIONS & INTEGRATIONS — scale + value ──────────── */}
      <Solutions />

      {/* ── THE SCROLL ACTS ───────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-6">
        <Act><ContentAddress /></Act>
        <Act><HolePunch /></Act>
        <Act><Capability /></Act>
        <Act><SkillSeal /></Act>
        <Act id="status"><StatusMatrix /></Act>
      </div>

      {/* ── INSTALL — run it on your own metal ────────────────── */}
      <Install />

      {/* ── CLOSING CTA ───────────────────────────────────────── */}
      <section className="section section-t relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-[120px]"
               style={{ background: "radial-gradient(circle, var(--color-signal), transparent 60%)" }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <p className="kicker">Build on infrastructure you own</p>
          <h2 className="t-section mt-6">
            Sovereignty isn&apos;t a feature.
            <br />
            It&apos;s the <span className="aurora-text">foundation</span>.
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="#install" className="btn-signal">Install now<span aria-hidden>→</span></a>
            <a href="#status" className="btn-ghost">Read the architecture</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}

function Act({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="section section-t scroll-mt-20">
      {children}
    </section>
  );
}
