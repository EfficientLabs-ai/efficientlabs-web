import { Reveal } from "@/components/Reveal";

/**
 * HONESTY LEDGER — the disarming last-objection-remover before the final CTA.
 * Three plain mono rows separating what is MEASURED from what is PREVIEW from what
 * is a COMMITMENT — the trust brand made literal. Claim-disciplined (honesty-guard
 * scans this file). Pure SSR + Reveal; reduced-motion = static.
 */
const ROWS = [
  {
    tag: "MEASURED",
    t: "Telemetry & receipts",
    d: "Context cache-hit, first-request cost, and every signed receipt — verifiable at /status.",
  },
  {
    tag: "MEASURED",
    t: "The System-2 layer, side by side",
    d: "A 12-step task run two ways: every governance and continuity check ran with zero model tokens and 66.7% fewer model calls — self-review, self-healing replay, and exact-state recovery all verified.",
  },
  {
    tag: "PREVIEW",
    t: "The orchestration surface",
    d: "The OS you can try signed-out — honest empty states, never a fabricated run.",
  },
  {
    tag: "COMMITMENT",
    t: "Offline proof, your keys",
    d: "Verify any receipt with the public key alone. Your work stays yours — even if you leave.",
  },
];

const TAG_COLOR: Record<string, string> = {
  MEASURED: "var(--color-signal)",
  PREVIEW: "var(--color-ink-faint)",
  COMMITMENT: "#3ddc97",
};

export default function HonestyLedger() {
  return (
    <section className="section relative scroll-mt-20">
      <div className="container-x">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <p className="mono text-center text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faint)]">
              No green stickers. The whole pitch, labeled.
            </p>
          </Reveal>
          <div className="mt-7 divide-y divide-[color:var(--color-line)] border-y border-[color:var(--color-line)]">
            {ROWS.map((r, i) => (
              <Reveal key={r.tag} delay={i * 0.06}>
                <div className="grid grid-cols-[7.5rem_1fr] items-baseline gap-4 py-5 sm:grid-cols-[9rem_1fr]">
                  <span
                    className="mono text-[10.5px] font-semibold tracking-[0.16em]"
                    style={{ color: TAG_COLOR[r.tag] }}
                  >
                    {r.tag}
                  </span>
                  <span>
                    <span className="text-[15px] text-[color:var(--color-ink)]">{r.t}</span>
                    <span className="mt-1 block text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
                      {r.d}
                    </span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.18}>
            <p className="mt-6 text-center text-[13px] text-[color:var(--color-ink-faint)]">
              See the full breakdown on the{" "}
              <a href="/score" className="text-[color:var(--color-signal)] underline decoration-dotted underline-offset-2">
                Autonomous Readiness Index
              </a>
              .
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
