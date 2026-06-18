import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LiveDesk from "@/components/landing/LiveDesk";
import Stakes from "@/components/landing/Stakes";
import AtmosphereReveal from "@/components/acts/AtmosphereReveal";
import ProofStrip from "@/components/ProofStrip";
import Preloader from "@/components/motion/Preloader";
import ProofLede from "@/components/landing/ProofLede";
import ReceiptProof from "@/components/landing/ReceiptProof";
import HowItWorks from "@/components/landing/HowItWorks";
import HonestyLedger from "@/components/landing/HonestyLedger";
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
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="relative">
      <script dangerouslySetInnerHTML={{ __html: INTRO_GATE }} />
      <Preloader />
      <Nav />

      {/* ── HOOK + CAPTURE · The Desk That Proves Itself — the real OS docked under one
          headline, with the live self-verifying receipt (Break it = the signature move). ── */}
      <LiveDesk />

      {/* ── INFORM (1) · the operator's stake: your best work lives in a window you don't own ── */}
      <Stakes />

      {/* ── INFORM (2) · The Clearing — extraction dissolves into the sovereign sky (ownership) ── */}
      <section id="atmosphere" className="cinematic">
        <AtmosphereReveal />
      </section>

      {/* ── PROOF · verifiability over vibes: the receipt that verifies itself + live telemetry ── */}
      <section id="proof" className="section section-t scroll-mt-20">
        <ProofLede />
        <ReceiptProof />
        <div className="mt-16">
          <ProofStrip embedded />
        </div>
      </section>

      {/* ── SELL · two doors — get your first receipt in the browser (web-first), CLI is Advanced ── */}
      <HowItWorks />

      {/* ── CTA · the honest close: the ledger of what's measured/preview/committed, then the door ── */}
      <HonestyLedger />
      <FinalCTA />

      <Footer />
    </main>
  );
}
