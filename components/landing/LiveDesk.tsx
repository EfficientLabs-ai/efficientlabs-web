"use client";
// ── HOMEPAGE HOOK + CAPTURE — the live, self-verifying receipt ────────────────────────────────────
// The hero is the claim + the REAL ReceiptVerifyCard: the visitor's own browser replays a real hash-
// chained, post-quantum-signed receipt and can "Break it" to watch the verdict flip. No dashboard
// chrome — the full Atmosphere OS lives at /app; the hero shows the one thing that sells, the proof.
// Brand film loops dim behind. Transform/opacity only; reduced-motion = settled; SSR ships every word.
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PUBLIC_STATUS } from "@/lib/public-status";
import ReceiptVerifyCard from "@/components/proof/ReceiptVerifyCard";
import { track } from "@/lib/analytics";

export default function LiveDesk() {
  const reduced = useReducedMotion();
  const [motionOk, setMotionOk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setMotionOk(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  const receipts = PUBLIC_STATUS.tiles.receipts;

  const fade = reduced
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-8%" },
        transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const },
      };

  return (
    <section className="relative overflow-hidden">
      {/* dim, desaturated brand film */}
      <div aria-hidden className="absolute inset-0">
        {motionOk ? (
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/media/hero/hero-poster.jpg"
            style={{ filter: "grayscale(0.35) brightness(0.5) contrast(1.05)", opacity: 0.6 }}
          >
            <source src="/media/hero/hero-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/media/hero/hero-poster.jpg"
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "grayscale(0.35) brightness(0.5)", opacity: 0.6 }}
          />
        )}
      </div>
      {/* legibility scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 105% at 66% 40%, transparent 8%, color-mix(in srgb, var(--color-void) 74%, transparent) 56%, var(--color-void) 100%)",
        }}
      />

      <div className="container-x relative grid items-center gap-10 py-28 sm:py-32 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-40">
        {/* ── left: the claim ── */}
        <div className="max-w-xl">
          <p className="kicker">AI you actually own</p>
          <h1 className="t-display mt-5">
            Own and prove <span className="aurora-text">everything your AI does</span>.
          </h1>
          <p className="t-body-lg mt-7 text-[color:var(--color-ink-dim)]">
            Your agents, workflows, and deliverables — kept on infrastructure you own, and provable to
            any client with a receipt you verify yourself. Try it on the right: no account, no install.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href="/start"
              onClick={() => track("cta_click", { location: "hero", cta: "Start free", href: "/start" })}
              className="btn-signal"
            >
              Start free<span aria-hidden>→</span>
            </a>
            <a
              href="#proof"
              onClick={() => track("cta_click", { location: "hero", cta: "See it prove itself", href: "#proof" })}
              className="btn-outline"
            >
              See it prove itself
            </a>
          </div>
          <p className="mono mt-6 text-[12px] text-[color:var(--color-ink-faint)]">
            Free forever · your work stays yours, even if you cancel
          </p>
        </div>

        {/* ── right: the live, self-verifying receipt — the signature move ── */}
        <motion.div {...fade} className="lg:pl-6">
          <p className="mono mb-3 text-[11px] uppercase tracking-[0.2em] text-[color:var(--color-ink-faint)]">
            A real, signed receipt — verify it yourself ↓
          </p>
          <ReceiptVerifyCard tile={receipts} />
        </motion.div>
      </div>
    </section>
  );
}
