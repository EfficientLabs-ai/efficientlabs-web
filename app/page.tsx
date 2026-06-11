import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MeshHero3D from "@/components/MeshHero3D";
import AtmosphereReveal from "@/components/acts/AtmosphereReveal";
import StratosAgent from "@/components/StratosAgent";
import SovereignPath from "@/components/SovereignPath";
import Solutions from "@/components/Solutions";
import Differentiators from "@/components/Differentiators";
import Architecture from "@/components/Architecture";
import Install from "@/components/Install";
import ContentAddress from "@/components/acts/ContentAddress";
import HolePunch from "@/components/acts/HolePunch";
import Capability from "@/components/acts/Capability";
import SkillSeal from "@/components/acts/SkillSeal";
import StatusMatrix from "@/components/acts/StatusMatrix";
import ProofStrip from "@/components/ProofStrip";
import SectionCTA from "@/components/SectionCTA";
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

      {/* ── CINEMATIC HERO — scroll dives the camera into a node ──
          .cinematic forces the dark dramatic palette locally so the WebGL hero
          stays theatrical even when the site is in light mode (pure CSS scope). */}
      <section className="cinematic">
        <MeshHero3D />
      </section>

      {/* ── THE ATMOSPHERE — extractive cloud dissolves into the sky ── */}
      <section id="atmosphere" className="cinematic">
        <AtmosphereReveal />
      </section>

      {/* ── PROOF — measured operating-layer telemetry, links /status ── */}
      <ProofStrip />

      {/* ── WHY IT'S DIFFERENT — mesh / seal / senses ─────────── */}
      <Differentiators />

      {/* ── THESIS STRIP ──────────────────────────────────────── */}
      <Architecture />

      {/* ── STRATOSAGENT — the agent, above the cloud ─────────── */}
      <StratosAgent />

      {/* ── SOVEREIGN PATH — SHOWS the local-first router in action ── */}
      <section id="routing" className="section section-t scroll-mt-20">
        <div className="container-x">
          <SovereignPath />
        </div>
      </section>

      {/* ── SOLUTIONS & INTEGRATIONS — scale + value ──────────── */}
      <Solutions />

      {/* ── THE SCROLL ACTS — each closes with one door forward ── */}
      <div className="mx-auto max-w-7xl px-6">
        <Act>
          <ContentAddress />
          <SectionCTA label="Read how content addressing works" href="/architecture" />
        </Act>
        <Act cinematic>
          <HolePunch />
          <SectionCTA label="Explore The Atmosphere" href="/atmosphere" />
        </Act>
        <Act>
          <Capability />
          <SectionCTA label="See the capability model in the docs" href="/docs" />
        </Act>
        <Act>
          <SkillSeal />
          <SectionCTA label="Browse the docs" href="/docs" />
        </Act>
        <Act id="status">
          <StatusMatrix />
          <SectionCTA label="Open the live status page" href="/status" />
        </Act>
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
            <a href="#status" className="btn-outline">Read the architecture</a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}

function Act({
  children,
  id,
  cinematic,
}: {
  children: React.ReactNode;
  id?: string;
  cinematic?: boolean;
}) {
  return (
    <section
      id={id}
      className={
        "section section-t scroll-mt-20" + (cinematic ? " cinematic" : "")
      }
    >
      {children}
    </section>
  );
}
