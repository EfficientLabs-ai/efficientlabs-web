import { KeyRound, Link2, ScanLine, BadgeCheck, Check } from "lucide-react";
import GlassCard from "@/components/glass/GlassCard";
import { Reveal } from "@/components/Reveal";

/**
 * PROOF centerpiece — "anatomy of a verifiable receipt." A glass receipt whose
 * fields tick verified under a descending scan line, landing on a VERIFIED
 * seal: the thesis "verifiability over vibes" made tangible. Sits under
 * ProofLede and above the real MEASURED telemetry strip (ProofStrip), which
 * stays — the receipt shows HOW we prove; the strip shows WHAT we measure.
 *
 * Receipts are a production capability; copy is claim-disciplined (honesty-guard
 * scans this file). Pure-CSS animation (.rcpt-* in globals.css) so the server
 * component ships every word in the SSR payload; reduced-motion = verified
 * static state.
 */
const FIELDS = [
  { k: "action", v: "skill.run · publish-cycle" },
  { k: "node", v: "efl-prod-01" },
  { k: "authority", v: "grant-A · founder approved" },
  { k: "decision", v: "ALLOW" },
  { k: "prev", v: "3f9c…a17e" },
  { k: "signature", v: "ed25519" },
];

const POINTS = [
  { icon: KeyRound, t: "Signed", d: "An ed25519 signature you check with the public key alone — no account, no API call." },
  { icon: Link2, t: "Hash-chained", d: "Each receipt seals the one before it. Alter a single record and the chain stops verifying." },
  { icon: ScanLine, t: "Verify it yourself", d: "Drop a receipt bundle on the status page and watch it verify in your own browser." },
];

export default function ReceiptProof() {
  return (
    <div className="container-x mt-12">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        {/* the receipt — verifies itself */}
        <Reveal>
          <GlassCard className="rcpt relative overflow-hidden p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <span className="mono text-[11px] tracking-[0.22em] text-[color:var(--color-ink-faint)]">RECEIPT</span>
              <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">b82d…6c40</span>
            </div>

            <div className="rcpt-fields mt-5">
              <span className="rcpt-scan" aria-hidden />
              {FIELDS.map((f, i) => (
                <div
                  key={f.k}
                  className="flex items-center justify-between gap-3 border-b border-[color:var(--color-line)]/60 py-[9px] last:border-0"
                >
                  <span className="mono text-[11.5px] uppercase tracking-[0.1em] text-[color:var(--color-ink-faint)]">{f.k}</span>
                  <span className="flex items-center gap-2.5">
                    <span className="mono text-[12.5px] text-[color:var(--color-ink)]">{f.v}</span>
                    <span
                      className="rcpt-tick grid h-4 w-4 place-items-center rounded-full"
                      style={{ ["--rcpt-d" as string]: `${i * 0.5}s`, background: "color-mix(in oklab, #3ddc97 18%, transparent)", color: "#3ddc97" }}
                      aria-hidden
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {/* the seal lands when the sweep completes */}
            <div className="mt-6 flex items-center justify-between">
              <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">public key · ed25519</span>
              <span
                className="rcpt-seal inline-flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{ background: "color-mix(in oklab, #3ddc97 14%, transparent)", border: "1px solid color-mix(in oklab, #3ddc97 36%, transparent)", color: "#3ddc97" }}
              >
                <BadgeCheck size={15} aria-hidden />
                <span className="mono text-[11.5px] font-semibold tracking-[0.14em]">VERIFIED</span>
              </span>
            </div>
          </GlassCard>
        </Reveal>

        {/* don't trust — verify */}
        <div>
          <Reveal delay={0.08}>
            <p className="t-body-lg text-[color:var(--color-ink)]">
              Anyone can say <span className="text-[color:var(--color-ink-faint)]">&ldquo;trust me.&rdquo;</span>{" "}
              We hand you <span className="aurora-text">the receipt.</span>
            </p>
            <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
              Every governed action emits a signed, hash-chained receipt — who acted, under whose
              authority, what was decided. The record is tamper-evident, and you don&apos;t take our
              word for it: you verify it.
            </p>
          </Reveal>

          <div className="mt-7 flex flex-col gap-4">
            {POINTS.map((p, i) => (
              <Reveal key={p.t} delay={0.14 + i * 0.06}>
                <div className="flex gap-3.5">
                  <span className="glass mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] text-[color:var(--color-signal)]">
                    <p.icon size={16} aria-hidden />
                  </span>
                  <div>
                    <p className="mono text-[12px] tracking-[0.16em] text-[color:var(--color-ink)]">{p.t.toUpperCase()}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">{p.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.34}>
            <a href="/status" className="mt-7 inline-flex items-center gap-1.5 text-[14px] font-medium text-[color:var(--color-signal)] transition-opacity hover:opacity-80">
              Verify a receipt yourself <span aria-hidden>→</span>
            </a>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
