import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MeshHero3D from "@/components/MeshHero3D";
import AtmosphereReveal from "@/components/acts/AtmosphereReveal";
import ProofStrip from "@/components/ProofStrip";
import Preloader from "@/components/motion/Preloader";
import Stakes from "@/components/landing/Stakes";
import Answer from "@/components/landing/Answer";
import ProofLede from "@/components/landing/ProofLede";
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

      {/* ── 2 · CINEMATIC HERO — scroll dives the camera into a node ──
          .cinematic forces the dark dramatic palette locally so the WebGL hero
          stays theatrical even when the site is in light mode (pure CSS scope). */}
      <section className="cinematic">
        <MeshHero3D />
      </section>

      {/* ── 3 · THE STAKES — name the fear before naming the product ── */}
      <Stakes />

      {/* ── 4 · THE ANSWER — the ownership layer: four frosted pillars ── */}
      <Answer />

      {/* ── 5 · PROOF — verifiability over vibes; ProofStrip telemetry ── */}
      <section id="proof" className="section section-t scroll-mt-20">
        <ProofLede />
        <div className="mt-10">
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
