"use client";
import { useState } from "react";
import { Check, Minus, Wallet } from "lucide-react";
import { Reveal, ActHeader } from "@/components/Reveal";

type Billing = "monthly" | "annual";

type Tier = {
  name: string;
  layer: string;            // atmospheric-layer name (brand metaphor)
  tagline: string;
  monthly?: number;         // $/mo (paid tiers)
  annual?: number;          // $/yr (paid tiers — 2 months free vs monthly)
  perSeat?: boolean;        // Team is per-seat
  fixedPrice?: string;      // Free / Enterprise (no toggle)
  fixedCadence?: string;
  links?: { monthly: string; annual: string };  // live Stripe checkout
  cta: { label: string; href?: string };        // href used only when no links
  featured?: boolean;
  features: string[];
};

// LIVE pricing (numbers + Stripe links frozen, founder-approved 2026-06-07). Value is anchored on
// GOVERNED WORKFLOWS + RECEIPTS + CONTINUITY — the things you actually buy — not on mesh compute
// (0 external devices today), which is shown as a labeled roadmap line only. Wallet + Contribution
// Credits track on every tier; rewards/payouts NOT live (counsel-gated). Free = install, no card.
const TIERS: Tier[] = [
  {
    name: "Free Forever",
    layer: "Troposphere",
    tagline: "Ground level. Own and prove your AI's work, on your own hardware.",
    fixedPrice: "$0",
    fixedCadence: "forever",
    cta: { label: "Start free", href: "/start" },
    features: [
      "StratosAgent + the Atmosphere runtime — free forever",
      "Own every workflow, decision & deliverable, on your hardware",
      "Signed, hash-chained receipts — verify offline with the public key",
      "Bring your own model — local + your own frontier keys",
      "Up to 2 nodes · community skills & support",
    ],
  },
  {
    name: "Exos Pro",
    layer: "Stratosphere",
    tagline: "For the operator who bills clients on what their AI produces.",
    monthly: 20,
    annual: 200,
    links: {
      monthly: "https://buy.stripe.com/eVq9AS5d13Bw56wbNg3AY0r",
      annual: "https://buy.stripe.com/14AdR8dJxb3Y2YobNg3AY0u",
    },
    cta: { label: "Start Exos Pro" },
    featured: true,
    features: [
      "Everything in Free, plus —",
      "Stronger continuity — your work persists across sessions & tools",
      "Runtime Score — see what your stack can and can't prove",
      "Publish & sync signed skills · turnkey connectors",
      "Email support",
      "P2P mesh clustering across your devices — rolling out",
    ],
  },
  {
    name: "Apex",
    layer: "Mesosphere",
    tagline: "Power tier — automate governed work and prove it to clients.",
    monthly: 100,
    annual: 1000,
    links: {
      monthly: "https://buy.stripe.com/00w4gy6h51to42s04y3AY0s",
      annual: "https://buy.stripe.com/eVq5kC48X0pk9mM9F83AY0v",
    },
    cta: { label: "Start Apex" },
    features: [
      "Everything in Exos Pro, plus —",
      "Advanced receipts — export & share verifiable proof with clients",
      "Governed-workflow automation + terminal workflows",
      "The full federated skill library + publishing",
      "Deeper Autonomous Readiness Index · priority support",
    ],
  },
  {
    name: "Apex Max",
    layer: "Ionosphere",
    tagline: "The ceiling — Apex pushed to its maximum.",
    fixedPrice: "—",
    fixedCadence: "pricing TBD",
    cta: { label: "Talk to us", href: "mailto:hello@efficientlabs.ai?subject=Apex%20Max" },
    features: [
      "Everything in Apex",
      "Highest limits & first-priority scheduling",
      "Advanced governance & deeper runtime intelligence",
      "Early access to new capabilities as they land",
    ],
  },
  {
    name: "Teams",
    layer: "Thermosphere",
    tagline: "Show clients exactly what the AI did — and bill for it.",
    monthly: 30,
    annual: 300,
    perSeat: true,
    links: {
      monthly: "https://buy.stripe.com/00w4gy8pddc656wbNg3AY0t",
      annual: "https://buy.stripe.com/8x26oG6h50pk42s5oS3AY0w",
    },
    cta: { label: "Start Teams" },
    features: [
      "Everything in Apex (min. 5 seats), plus —",
      "Shared workspaces + a team receipt chain",
      "Per-member attribution + approval queues",
      "Role-based access control + audit-ready evidence",
      "SSO / SCIM · business & policy controls",
    ],
  },
  {
    name: "Enterprise",
    layer: "Exosphere",
    tagline: "The edge of space — governance, air-gap, total control.",
    fixedPrice: "Custom",
    cta: { label: "Contact sales", href: "mailto:hello@efficientlabs.ai?subject=Enterprise%20early%20access" },
    features: [
      "Everything in Teams",
      "Private deployment · on-prem & air-gapped",
      "Compliance-ready evidence (HIPAA / SOC 2 readiness) · data residency",
      "Private capability registry + commercial license",
      "SLAs · dedicated engineering · red-team review",
    ],
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const annual = billing === "annual";

  return (
    <section className="relative overflow-hidden pt-36 pb-28">
      {/* aurora glows — give the tier cards' glass vivid light to frost */}
      <div aria-hidden className="aurora-field">
        <div className="glow glow-azure left-1/2 top-4 h-[30rem] w-[46rem] -translate-x-1/2" />
        <div className="glow glow-cyan -left-20 top-[26rem] h-[26rem] w-[34rem]" />
        <div className="glow glow-violet -right-16 top-[20rem] h-[28rem] w-[34rem]" />
      </div>

      <div className="relative mx-auto max-w-[84rem] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <ActHeader index="—" kicker="Pricing" title={<>Own it. Prove it. <span className="aurora-text">No meter</span>, ever.</>}>
            Flat pricing for software you run on your own hardware. You&apos;re never billed per token,
            per request, or per gigabyte of egress. You pay for governed workflows, verifiable receipts,
            and continuity — sovereignty itself is always free.
          </ActHeader>
        </div>

        {/* ── Monthly / Annual toggle (annual = 2 months free) ─────────────── */}
        <Reveal>
          <div className="mt-10 flex items-center justify-center">
            <div
              role="group"
              aria-label="Billing period"
              className="glass inline-flex items-center gap-1 rounded-[var(--radius-pill)] p-1"
            >
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                aria-pressed={!annual}
                className={`mono rounded-[var(--radius-pill)] px-4 py-1.5 text-[12px] transition-colors ${
                  !annual
                    ? "bg-[color:var(--color-signal)] text-white"
                    : "text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                aria-pressed={annual}
                className={`mono inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-1.5 text-[12px] transition-colors ${
                  annual
                    ? "bg-[color:var(--color-signal)] text-white"
                    : "text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)]"
                }`}
              >
                Annual
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] tracking-wider ${
                    annual ? "bg-white/20 text-white" : "bg-[color:var(--color-quantum)]/15 text-[color:var(--color-quantum-text)]"
                  }`}
                >
                  2 MONTHS FREE
                </span>
              </button>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TIERS.map((t, i) => {
            const paid = t.monthly != null && t.annual != null && t.links;
            const price = paid ? (annual ? t.annual! : t.monthly!) : null;
            const cadence = paid ? (annual ? "/yr" : "/mo") : t.fixedCadence;
            const perMonthAnnual = paid && annual ? (t.annual! / 12) : null;
            const href = paid ? (annual ? t.links!.annual : t.links!.monthly) : t.cta.href;
            const external = href?.startsWith("http");

            return (
              <Reveal key={t.name} delay={0.04 * i}>
                <div className={`lm-card is-interactive relative flex h-full flex-col p-5 ${t.featured ? "ring-1 ring-[color:var(--color-signal)]/40" : ""}`}>
                  {t.featured && (
                    <span className="mono absolute -top-2.5 left-5 rounded-full border border-[color:var(--color-signal)]/40 bg-[color:var(--color-signal)]/15 px-2.5 py-0.5 text-[10px] tracking-wider text-[color:var(--color-signal)]">
                      MOST POPULAR
                    </span>
                  )}

                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faint)]">
                    {t.layer}
                  </span>
                  <h3 className="display mt-1 text-[1.25rem] text-[color:var(--color-ink)]">{t.name}</h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="display text-[2.1rem] text-[color:var(--color-ink)]">
                      {paid ? `$${price}` : t.fixedPrice}
                    </span>
                    {cadence && (
                      <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">
                        {cadence}{t.perSeat ? " · seat" : ""}
                      </span>
                    )}
                  </div>
                  {/* annual sub-line: effective monthly + savings */}
                  <p className="mono mt-1 h-4 text-[10.5px] text-[color:var(--color-quantum-text)]">
                    {perMonthAnnual != null
                      ? `≈ $${perMonthAnnual.toFixed(perMonthAnnual % 1 === 0 ? 0 : 2)}/mo billed annually · 2 months free`
                      : ""}
                  </p>

                  <p className="mt-2 min-h-[2.4rem] text-[12.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{t.tagline}</p>

                  <a
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`mt-4 ${t.featured ? "btn-signal" : "btn-outline"} justify-center text-center text-[13px]`}
                  >
                    {t.cta.label}{t.featured && <span aria-hidden> →</span>}
                  </a>

                  <ul className="mt-6 space-y-2.5">
                    {t.features.map((f, fi) => (
                      <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-[color:var(--color-ink-dim)]">
                        {fi === 0 && i > 0
                          ? <Minus size={14} className="mt-0.5 shrink-0 text-[color:var(--color-ink-faint)]" />
                          : <Check size={14} className="mt-0.5 shrink-0 text-[color:var(--color-signal)]" />}
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Wallet + contribution tracking — present on EVERY tier; payouts NOT live. */}
                  <div className="mt-auto pt-5">
                    <div className="flex items-start gap-2 border-t border-[color:var(--color-line)] pt-3 text-[11.5px] leading-snug text-[color:var(--color-ink-faint)]">
                      <Wallet size={13} className="mt-0.5 shrink-0 text-[color:var(--color-ink-faint)]" aria-hidden />
                      <span>
                        Wallet + Contribution Credits tracked.{" "}
                        <span className="mono text-[color:var(--color-ink-faint)]">Payouts not live.</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* ── ATMOS CREDITS — the expansion layer, never the meter ───────── */}
        <Reveal>
          <div className="lm-card mt-8 gap-6 p-6 md:flex md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="kicker">Need extra compute?</p>
              <h3 className="t-card mt-2">Atmos Credits</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
                Credits can come from node participation, distributed compute contribution,
                your subscription&apos;s allocation, or direct purchase — pay-as-you-go later.
                Compute is an expansion layer, never the business model: your tier is flat,
                and credits only ever buy <em>more</em>, not access.
              </p>
              <p className="mono mt-2 text-[11px] text-[color:var(--color-ink-faint)]">
                Credits are tracked today; redemption is not live (counsel-gated).
              </p>
            </div>
            <a
              href="mailto:hello@efficientlabs.ai?subject=Atmos%20Credits"
              className="btn-outline mt-5 shrink-0 text-[13px] md:mt-0"
            >
              Ask about credits <span aria-hidden>→</span>
            </a>
          </div>
        </Reveal>

        <p className="mono mt-10 text-center text-[12px] text-[color:var(--color-ink-faint)]">
          StratosAgent is free forever. Annual saves 2 months · no per-token billing · no egress fees · no lock-in · cancel anytime.
          <br />
          Early access — features open as they land. Contribution tracking is active across all tiers;
          the rewards / payout layer is not live (counsel-gated, no return promised).
        </p>
      </div>
    </section>
  );
}
