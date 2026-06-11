// The landing-page PROOF section — four compact tiles from the operating
// layer's published artifact (data/public-status.json) + a link to the full
// /status page. The thesis: operational proof before public proof. Copy here
// is a policed marketing surface (honesty-guard scans this file); the numbers
// are MEASURED or they do not render.
import Link from "next/link";
import { PUBLIC_STATUS } from "@/lib/public-status";
import { VERDICT, LabelChip, UpdatedAt } from "@/components/proof/bits";

export default function ProofStrip() {
  const { heartbeat, receipts, routing, activation } = PUBLIC_STATUS.tiles;
  const verdictColor = heartbeat.color ? VERDICT[heartbeat.color] : "#5b6675";

  return (
    <section id="proof" className="section section-t scroll-mt-20">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="kicker">Proof</p>
            <h2 className="t-section mt-3">
              Operational proof <span className="aurora-text">before</span> public proof.
            </h2>
          </div>
          <p className="max-w-md text-[13px] leading-relaxed text-[color:var(--color-ink-faint)]">
            We run our own company on this system, and publish its telemetry. Numbers below are measured
            from the operating layer itself — where something is not measured, it says so.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* heartbeat verdict */}
          <Link href="/status" className="lm-card is-interactive flex flex-col gap-1 p-5">
            {heartbeat.label === "MEASURED" && heartbeat.color ? (
              <>
                <span className="mono inline-flex items-center gap-2 text-[13px] font-semibold" style={{ color: verdictColor }}>
                  <span className="h-2 w-2 rounded-full" style={{ background: verdictColor }} />
                  {heartbeat.color}
                </span>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">operating-layer heartbeat</span>
                <span className="text-[11px] text-[color:var(--color-ink-faint)]">
                  {heartbeat.fail} fail · {heartbeat.warn} warn · {heartbeat.ok} ok — warns published, not hidden
                </span>
                <UpdatedAt updatedAt={heartbeat.updated_at} />
              </>
            ) : (
              <>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">operating-layer heartbeat</span>
                <LabelChip label={null} />
              </>
            )}
          </Link>

          {/* receipts */}
          <Link href="/status" className="lm-card is-interactive flex flex-col gap-1 p-5">
            {receipts.label === "MEASURED" ? (
              <>
                <span className="display leading-none text-[1.8rem]">{receipts.count}</span>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">
                  signed receipt{receipts.count === 1 ? "" : "s"} · chain intact
                </span>
                <span className="text-[11px] text-[color:var(--color-ink-faint)]">
                  hybrid post-quantum signatures — verify them in your own browser →
                </span>
                <UpdatedAt updatedAt={receipts.updated_at} />
              </>
            ) : (
              <>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">signed receipts</span>
                <LabelChip label={null} />
              </>
            )}
          </Link>

          {/* routing */}
          <Link href="/status" className="lm-card is-interactive flex flex-col gap-1 p-5">
            {routing.label === "MEASURED" ? (
              <>
                <span className="display leading-none text-[1.8rem]" style={{ color: "var(--color-signal)" }}>
                  {routing.rung1_pct}%
                </span>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">of logged work ran as scripts</span>
                <span className="text-[11px] text-[color:var(--color-ink-faint)]">
                  not the flagship model — {routing.total} routing decisions, self-attested log
                </span>
                <UpdatedAt updatedAt={routing.updated_at} />
              </>
            ) : (
              <>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">routing distribution</span>
                <LabelChip label={null} />
              </>
            )}
          </Link>

          {/* activation */}
          <Link href="/status" className="lm-card is-interactive flex flex-col gap-1 p-5">
            {activation.label === "MEASURED" ? (
              <>
                <span className="display leading-none text-[1.8rem]">
                  {activation.production}<span className="text-[0.6em] text-[color:var(--color-ink-faint)]"> of {activation.total}</span>
                </span>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">components at PRODUCTION</span>
                <span className="text-[11px] text-[color:var(--color-ink-faint)]">
                  {activation.total! - activation.production!} gaps shown — the gaps are the credibility
                </span>
                <UpdatedAt updatedAt={activation.updated_at} />
              </>
            ) : (
              <>
                <span className="mono text-[12px] text-[color:var(--color-ink)]">activation matrix</span>
                <LabelChip label={null} />
              </>
            )}
          </Link>
        </div>

        <div className="mt-6">
          <Link href="/status" className="btn-outline text-[13px]">
            Verify everything yourself <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
