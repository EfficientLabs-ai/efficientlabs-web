import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroVideo from "@/components/HeroVideo";
import AtmosphereReveal from "@/components/acts/AtmosphereReveal";
import ArchitectureFilm from "@/components/acts/ArchitectureFilm";
import CinematicTransition from "@/components/acts/CinematicTransition";
import ProofStrip from "@/components/ProofStrip";
import Preloader from "@/components/motion/Preloader";
import Stakes from "@/components/landing/Stakes";
import Answer from "@/components/landing/Answer";
import ProofLede from "@/components/landing/ProofLede";
import ReceiptProof from "@/components/landing/ReceiptProof";
import HowItWorks from "@/components/landing/HowItWorks";
import ReadinessCards from "@/components/landing/ReadinessCards";
import NodeConsole from "@/components/landing/NodeConsole";
import ReadinessLadder from "@/components/landing/ReadinessLadder";
import FinalCTA from "@/components/landing/FinalCTA";
import type { Metadata } from "next";

// Pre-paint gate for the preloader: mark the visit "pending" ONLY when this
// session hasn't seen the intro, motion is allowed, and JS is running. CSS
// shows the overlay solely under [data-intro="pending"], so no-JS and
// reduced-motion visitors never see it. Mirrors the theme pre-paint script.
const INTRO_GATE =
  "(function(){try{if(sessionStorage.getItem('efl-intro-seen'))return;" +
  "if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;" +
  "document.documentElement.setAttribute('data-intro','pending');}catch(e){}})();";

// Only override the canonical; inherit the root openGraph (image/title/desc) intact.
// In App Router a child `openGraph` REPLACES the parent's rather than deep-merging.
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="relative">
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <Preloader />
      <Nav />

      {/* ── 2 · HERO — seamless-looping cinematic brand film; full-screen, then
          transitions into the site on scroll. HeroVideo owns its own .cinematic
          section. WebGL hero (MeshHero3D) kept dormant as a fallback option. ── */}
      <HeroVideo />

      {/* ── 3 · THE STAKES — name the fear before naming the product ── */}
      <Stakes />

      {/* ── 3b · THE ARCHITECTURE — cinematic journey film scrubbed across the 7
          real layer beats (Act 2: the stack). Canvas fallback lives in
          ArchitectureSequence.tsx (dormant). ── */}
      <section className="cinematic">
        <ArchitectureFilm />
      </section>

      {/* ── 3c · 360° TRANSITION — a cinematic breath orbiting out of the stack
          into the ownership story (one continuous film) ── */}
      <section className="cinematic">
        <CinematicTransition
          dir="/media/cinematic/orbit"
          count={91}
          heightVh={150}
          kicker="The ownership layer"
          title={<>Owned. Governed. <span className="aurora-text">Proven.</span></>}
        />
      </section>

      {/* ── 4 · THE ANSWER — the ownership layer: four frosted pillars ── */}
      <Answer />

      {/* ── 5 · PROOF — verifiability over vibes; ProofStrip telemetry ── */}
      <section id="proof" className="section section-t scroll-mt-20">
        <ProofLede />
        {/* the receipt that verifies itself — HOW we prove */}
        <ReceiptProof />
        {/* the live MEASURED telemetry — WHAT we prove */}
        <div className="mt-16">
          <ProofStrip embedded />
        </div>
      </section>

      {/* ── 5b · THE READINESS INDEX — 12-dimension ARI card grid, honest-null ── */}
      <ReadinessCards />

      {/* ── 6 · THE ATMOSPHERE — extractive cloud dissolves into the sky ── */}
      <section id="atmosphere" className="cinematic">
        <AtmosphereReveal />
      </section>

      {/* ── 7 · HOW IT WORKS — start free, own it in one line ── */}
      <HowItWorks />

      {/* ── 7b · THE NODE CONSOLE — glass preview of the node-served console ── */}
      <NodeConsole />

      {/* ── 8 · HONEST READINESS LADDER — honesty as the trust signal ── */}
      <ReadinessLadder />

      {/* ── 9 · FINAL CTA — the two free, low-risk doors ── */}
      <FinalCTA />

      {/* ── 10 · FOOTER ── */}
      <Footer />
    </main>
  );
}
