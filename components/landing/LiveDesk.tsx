"use client";
// ── HOMEPAGE HOOK + CAPTURE — "The Desk That Proves Itself" ──────────────────────────────────────
// The hero docks a faithful slab of the Atmosphere OS (rail + a real "Client deliverable → receipt"
// workflow card) and pins the LIVE ReceiptVerifyCard inside it. The visitor's own browser verifies a
// real hash-chained, post-quantum-signed receipt and can "Break it" to watch the verdict flip — the
// marketing artifact and the product are the same artifact. The brand film loops dim + desaturated
// behind the glass, so the saturation budget is spent on the working desk. Transform/opacity only;
// reduced-motion renders the settled state; SSR ships every word.
import { useEffect, useState } from "react";
import { Home, Bot, Workflow, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PUBLIC_STATUS } from "@/lib/public-status";
import ReceiptVerifyCard from "@/components/proof/ReceiptVerifyCard";

const RAIL = [
  { icon: Home, label: "Home" },
  { icon: Bot, label: "Agents" },
  { icon: Workflow, label: "Workflows", active: true },
  { icon: Wallet, label: "Wallet" },
];

export default function LiveDesk() {
  const reduced = useReducedMotion();
  const [motionOk, setMotionOk] = useState(false);
  useEffect(() => {
    setMotionOk(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const receipts = PUBLIC_STATUS.tiles.receipts;

  // one ease family, transform/opacity only — the desk "powers on"
  const boot = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 10 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-8%" },
          transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] as const, delay: i * 0.06 },
        };

  return (
    <section className="relative overflow-hidden">
      {/* dim, desaturated brand film behind the glass desk */}
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
            style={{ filter: "grayscale(0.5) brightness(0.4) contrast(1.05)", opacity: 0.5 }}
          >
            <source src="/media/hero/hero-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/media/hero/hero-poster.jpg"
            alt=""
            className="h-full w-full object-cover"
            style={{ filter: "grayscale(0.5) brightness(0.4)", opacity: 0.5 }}
          />
        )}
      </div>
      {/* legibility scrim */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 105% at 68% 38%, transparent 6%, color-mix(in srgb, var(--color-void) 76%, transparent) 56%, var(--color-void) 100%)",
        }}
      />

      <div className="container-x relative grid items-center gap-10 py-28 sm:py-32 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14 lg:py-36">
        {/* ── left: the claim ── */}
        <div className="max-w-xl">
          <p className="kicker">AI you actually own</p>
          <h1 className="t-display mt-5">
            This is the desk. <span className="aurora-text">Run a step, get a receipt,</span> show your client.
          </h1>
          <p className="t-body-lg mt-7 text-[color:var(--color-ink-dim)]">
            The real Atmosphere OS — not a screenshot. Verify the receipt on the right in your own
            browser, then break it. No account, no install.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="/start" className="btn-signal">
              Start free<span aria-hidden>→</span>
            </a>
            <a href="#proof" className="btn-outline">
              See it prove itself
            </a>
          </div>
          <p className="mono mt-6 text-[12px] text-[color:var(--color-ink-faint)]">
            Free forever · your work stays yours, even if you cancel
          </p>
        </div>

        {/* ── right: the docked desk ── */}
        <motion.div {...boot(0)} className="glass relative overflow-hidden rounded-[var(--radius-lg)] p-3 sm:p-4">
          {/* desk status bar */}
          <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-2 pb-3">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-signal)" }} />
              <span className="mono text-[10.5px] tracking-[0.18em] text-[color:var(--color-ink-faint)]">
                ATMOSPHERE OS · PREVIEW
              </span>
            </span>
            <span className="mono text-[10.5px] text-[color:var(--color-ink-faint)]">node efl-prod-01</span>
          </div>

          <div className="flex gap-3 pt-3">
            {/* sidebar rail */}
            <div className="flex shrink-0 flex-col gap-1.5">
              {RAIL.map((r, i) => (
                <motion.span
                  key={r.label}
                  {...boot(1 + i)}
                  className="flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[color:var(--color-ink-faint)]"
                  style={
                    r.active
                      ? { background: "color-mix(in srgb, var(--color-signal) 12%, transparent)", color: "var(--color-ink)" }
                      : undefined
                  }
                >
                  <r.icon size={15} aria-hidden />
                  <span className="hidden text-[12px] sm:inline">{r.label}</span>
                </motion.span>
              ))}
            </div>

            {/* main area */}
            <div className="min-w-0 flex-1">
              {/* a real workflow card — honest "done" state */}
              <motion.div
                {...boot(5)}
                className="rounded-[var(--radius-sm)] border border-[color:var(--color-line)] p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-[color:var(--color-ink)]">Client deliverable → receipt</span>
                  <span className="mono inline-flex items-center gap-1.5 text-[10.5px]" style={{ color: "#3ddc97" }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#3ddc97" }} /> done
                  </span>
                </div>
                <p className="mono mt-1.5 text-[10.5px] text-[color:var(--color-ink-faint)]">
                  skill.run · 1 step · signed receipt emitted
                </p>
              </motion.div>

              {/* the docked, self-verifying receipt — the signature move */}
              <motion.div {...boot(6)} className="mt-3">
                <ReceiptVerifyCard tile={receipts} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
