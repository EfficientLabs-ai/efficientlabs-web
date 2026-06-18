"use client";
// ── HOMEPAGE HOOK + CAPTURE — "The Desk That Proves Itself" ──────────────────────────────────────
// The hero mirrors the REAL Atmosphere OS home (/app): the same module rail, the same HONEST zero-
// states (—/0, "Preview"), and the live "Inference routing · governed" row that is the actual
// System-2-governs-the-model behaviour — then pins the LIVE ReceiptVerifyCard so the visitor's own
// browser verifies a real hash-chained, post-quantum receipt and can "Break it." No demo-vs-reality
// gap: every label here matches what app/app/page.tsx renders. Brand film loops dim behind the glass.
// Transform/opacity only; reduced-motion = settled; SSR ships every word.
import { useEffect, useState } from "react";
import { Cpu, Workflow, Sparkles, Brain, Wallet, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { PUBLIC_STATUS } from "@/lib/public-status";
import ReceiptVerifyCard from "@/components/proof/ReceiptVerifyCard";

// the real module rail (matches components/os/modules.ts + app/app/page.tsx)
const RAIL: { icon: LucideIcon; label: string; active?: boolean }[] = [
  { icon: Cpu, label: "Agents" },
  { icon: Workflow, label: "Workflows", active: true },
  { icon: Sparkles, label: "Skills" },
  { icon: Brain, label: "Memory" },
  { icon: Wallet, label: "Wallet" },
];

// the real OverviewBand honest zero-states (matches app/app/page.tsx — never a fabricated number)
const STATS = [
  { label: "Active agents", value: "—", note: "no agent connected" },
  { label: "Running workflows", value: "0", note: "none active" },
  { label: "Nodes paired", value: "0 / 2", note: "free tier" },
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
          transition: { duration: 0.55, ease: [0.25, 1, 0.5, 1] as const, delay: i * 0.05 },
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
            Own and prove <span className="aurora-text">everything your AI does</span>.
          </h1>
          <p className="t-body-lg mt-7 text-[color:var(--color-ink-dim)]">
            Your agents, workflows, and deliverables — kept on infrastructure you own, and provable to
            any client with a receipt you verify yourself. Try it on the right: no account, no install.
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

        {/* ── right: a faithful preview of your real Atmosphere OS (/app) ── */}
        <motion.div {...boot(0)} className="glass relative overflow-hidden rounded-[var(--radius-lg)] p-3 sm:p-4">
          {/* desk status bar */}
          <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-2 pb-3">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--color-signal)" }} />
              <span className="mono text-[10.5px] tracking-[0.18em] text-[color:var(--color-ink-faint)]">
                ATMOSPHERE OS · PREVIEW
              </span>
            </span>
            <a href="/app" className="mono text-[10.5px] text-[color:var(--color-signal)] hover:opacity-80">
              open the full dashboard →
            </a>
          </div>

          <div className="flex gap-3 pt-3">
            {/* real module rail */}
            <div className="flex shrink-0 flex-col gap-1">
              {RAIL.map((r, i) => (
                <motion.span
                  key={r.label}
                  {...boot(1 + i)}
                  className="relative flex items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-[color:var(--color-ink-dim)]"
                  style={
                    r.active
                      ? { background: "var(--color-void-2)", color: "var(--color-ink)" }
                      : undefined
                  }
                >
                  {r.active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full"
                      style={{ background: "var(--color-signal)" }}
                    />
                  )}
                  <r.icon size={15} className={r.active ? "text-[color:var(--color-signal)]" : ""} aria-hidden />
                  <span className="hidden text-[12px] sm:inline">{r.label}</span>
                </motion.span>
              ))}
            </div>

            {/* main area — mirrors /app: header · honest overview · live routing · the receipt */}
            <div className="min-w-0 flex-1 space-y-3">
              <motion.div {...boot(6)} className="flex items-center justify-between">
                <span className="text-[13px] text-[color:var(--color-ink)]">
                  Your <span className="aurora-text">Atmosphere</span>
                </span>
                <span className="mono rounded-full border border-[color:var(--color-line)] px-2 py-0.5 text-[9.5px] tracking-[0.14em] text-[color:var(--color-ink-faint)]">
                  PREVIEW
                </span>
              </motion.div>

              {/* honest overview tiles — the SAME zero-states the real /app shows */}
              <motion.div {...boot(7)} className="grid grid-cols-3 gap-2">
                {STATS.map((s) => (
                  <div key={s.label} className="rounded-[var(--radius-sm)] border border-[color:var(--color-line)] p-2.5">
                    <p className="text-[10px] leading-tight text-[color:var(--color-ink-faint)]">{s.label}</p>
                    <p className="mono mt-1 text-[16px] text-[color:var(--color-ink-dim)]">{s.value}</p>
                    <p className="mono mt-0.5 text-[8.5px] text-[color:var(--color-ink-faint)]">{s.note}</p>
                  </div>
                ))}
              </motion.div>

              {/* the live, governed inference router (System 2 governs the model) — real & LIVE */}
              <motion.div
                {...boot(8)}
                className="flex items-center gap-2.5 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] px-3 py-2"
              >
                <Radio size={14} className="shrink-0 text-[color:var(--color-signal)]" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[11.5px] text-[color:var(--color-ink-dim)]">
                  Inference routing · local-first, governed · cost gate on your keys
                </span>
                <span className="mono text-[9.5px] tracking-[0.14em]" style={{ color: "#3ddc97" }}>
                  LIVE
                </span>
              </motion.div>

              {/* the docked, self-verifying receipt — the signature move */}
              <motion.div {...boot(9)}>
                <ReceiptVerifyCard tile={receipts} />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
