import Aurora from "@/components/glass/Aurora";
import GlassCard from "@/components/glass/GlassCard";
import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";
import SectionEntrance from "@/components/motion/SectionEntrance";
import SectionCTA from "@/components/SectionCTA";
import { VERDICT } from "@/components/proof/palette";

/**
 * THE READINESS INDEX — a 12-dimension card grid for the Agent Readiness Index.
 * Each dimension carries a maturity label that is the TRUTH, not a sales number:
 *   MEASURED   → instrumented, the live score reads it today (verdict green)
 *   WIRED      → connected and working, telemetry not yet scored (quantum blue)
 *   DOCUMENTED → specified, honest-null until its telemetry lands (grey/dim)
 * The denominator on the framing line ("N of 12") is COMPUTED from the data, so
 * the honest-null framing can never drift away from what the array actually says.
 * Server-rendered; SectionEntrance staggers the cards in (transform/opacity only).
 */

type Maturity = "MEASURED" | "WIRED" | "DOCUMENTED";

const DIMENSIONS: { name: string; maturity: Maturity; line: string }[] = [
  { name: "Runtime", maturity: "MEASURED", line: "Token usage, routing, cache, session economics." },
  { name: "Cost Efficiency", maturity: "MEASURED", line: "Frontier vs delegated, calls avoided." },
  { name: "Continuity", maturity: "MEASURED", line: "Session recovery, memory, compaction resilience." },
  { name: "Ownership", maturity: "MEASURED", line: "Local-first state, export/delete readiness." },
  { name: "Infrastructure", maturity: "WIRED", line: "Node health, gateway, compute, mesh." },
  { name: "Safety", maturity: "WIRED", line: "Sandboxing, denial audit, deny-by-default, secret redaction." },
  { name: "Governance", maturity: "DOCUMENTED", line: "Authority gates, protected actions, approval records." },
  { name: "Agent Readiness", maturity: "DOCUMENTED", line: "Agent/StratosAgent readiness, MCP/Composio." },
  { name: "Automation Readiness", maturity: "DOCUMENTED", line: "Triggers, idempotency, receipts, outcomes." },
  { name: "Commerce Readiness", maturity: "DOCUMENTED", line: "Wallets, budgets, approval-gated spend." },
  { name: "Identity Readiness", maturity: "DOCUMENTED", line: "Node/owner/account binding, whose authority." },
  { name: "Settlement Readiness", maturity: "DOCUMENTED", line: "Which agent, whose authority, which budget." },
];

// Maturity → presentation. Color comes from the existing verdict palette so the
// readiness grid speaks the same colour language as the proof tiles.
const MATURITY: Record<Maturity, { color: string; fill: number }> = {
  MEASURED: { color: VERDICT.GREEN, fill: 100 }, // instrumented today
  WIRED: { color: "var(--color-quantum-text)", fill: 62 }, // connected, not yet scored
  DOCUMENTED: { color: "#5b6675", fill: 24 }, // specified, honest-null
};

export default function ReadinessCards() {
  // Denominator is derived, never hardcoded — this IS the honest framing.
  const measured = DIMENSIONS.filter((d) => d.maturity === "MEASURED").length;
  const total = DIMENSIONS.length;
  // gauge geometry — the measured arc length is derived from the same truth.
  const R = 52;
  const C = 2 * Math.PI * R;
  const arcLen = (measured / total) * C;

  return (
    <section
      id="readiness-index"
      className="section section-t relative overflow-hidden scroll-mt-20"
    >
      <Aurora variant="balanced" />
      <SectionEntrance variant="statement" className="container-x relative">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <KickerLabel index="—" text="The readiness index" />
            <SplitHeading as="h2" className="t-section mt-6">
              What can your AI stack <span className="aurora-text">actually prove?</span>
            </SplitHeading>
            <p
              data-motion="body"
              className="t-body-lg mt-7 max-w-2xl text-[color:var(--color-ink-dim)]"
            >
              The live score instruments {measured} of {total}&nbsp;dimensions today; the rest render
              honest-null until their telemetry lands. The empty cells aren&apos;t hidden — they&apos;re
              the map of what&apos;s left to wire.
            </p>
          </div>

          {/* the ARI gauge — the measured arc is derived from the same data */}
          <div data-motion="card" className="relative mx-auto grid h-[148px] w-[148px] shrink-0 place-items-center lg:mx-0">
            <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden>
              <circle cx="64" cy="64" r={R} fill="none" stroke="var(--color-edge)" strokeWidth="8" />
              <circle
                cx="64" cy="64" r={R} fill="none" stroke="#3ddc97" strokeWidth="8" strokeLinecap="round"
                className="ari-arc"
                style={{ ["--arc" as string]: `${arcLen}`, strokeDasharray: `${arcLen} ${C}` }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="t-section text-[2rem] leading-none text-[color:var(--color-ink)]">
                {measured}<span className="text-[color:var(--color-ink-faint)]">/{total}</span>
              </span>
              <span className="mono mt-1.5 text-[10px] tracking-[0.18em] text-[color:#3ddc97]">MEASURED</span>
            </div>
          </div>
        </div>

        <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DIMENSIONS.map((d) => {
            const m = MATURITY[d.maturity];
            return (
              <GlassCard
                key={d.name}
                material="flat"
                as="li"
                data-motion="card"
                className="flex h-full flex-col p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="t-card text-[1rem]">{d.name}</h3>
                  <span
                    className="mono inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-pill)] border px-2 py-0.5 text-[10px] tracking-[0.14em]"
                    style={{
                      borderColor: `color-mix(in oklab, ${m.color} 40%, transparent)`,
                      color: m.color,
                    }}
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: m.color }}
                    />
                    {d.maturity}
                  </span>
                </div>

                {/* maturity bar — qualitative fill per status, not a fake metric */}
                <div
                  className="mt-4 h-1 w-full overflow-hidden rounded-full bg-[color:var(--color-edge)]"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${m.fill}%`, background: m.color }}
                  />
                </div>

                <p className="mt-3 text-[12.5px] leading-relaxed text-[color:var(--color-ink-faint)]">
                  {d.line}
                </p>
              </GlassCard>
            );
          })}
        </ul>

        <div data-motion="cta">
          <SectionCTA label="Run your free assessment" href="/score" />
        </div>
      </SectionEntrance>
    </section>
  );
}
