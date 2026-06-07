"use client";
import { Check, Minus, Wallet } from "lucide-react";
import { Reveal, ActHeader } from "@/components/Reveal";

type Tier = {
  name: string;
  layer: string;           // atmospheric-layer name (brand metaphor)
  price: string;
  cadence?: string;
  tagline: string;
  cta: { label: string; href: string };
  featured?: boolean;
  features: string[];
};

// DRAFT pricing — flat, NEVER metered. Gated on meshed-node count, not usage.
// Numbers benchmarked to 2026 competitor structure ($0 / $20 / $100 / seat / custom)
// and themed to the atmospheric-layer brand metaphor. Pending operator approval.
//
// FULL tier set per ATMOSPHERE_ECONOMY.md §11: Free / Pro / Builder(Max) / Team / Enterprise.
// CLAIM DISCIPLINE (§11, hard): wallet + Contribution Credits track across ALL tiers,
// but rewards are NOT live. Every wallet line reads "Contribution tracking · payouts not live".
// Banned: any "earn SOL", "passive income", "DePIN rewards live", "invest" language.
const TIERS: Tier[] = [
  {
    name: "Free",
    layer: "Troposphere",
    price: "$0",
    cadence: "forever",
    tagline: "Ground level. Run it on your own hardware, sovereign and DIY.",
    cta: { label: "Install now", href: "/install" },
    features: [
      "Up to 2 nodes (e.g. your laptop + phone)",
      "The Atmosphere runtime + StratosAgent",
      "Bring your own model — local + frontier keys, unlimited",
      "Content-addressed · post-quantum sealed",
      "Join the mesh · community skills + support",
    ],
  },
  {
    name: "Pro",
    layer: "Stratosphere",
    price: "$20",
    cadence: "/mo",
    tagline: "Above the clouds — where StratosAgent flies.",
    cta: { label: "Start Pro", href: "mailto:hello@efficientlabs.ai?subject=Pro%20early%20access" },
    featured: true,
    features: [
      "Up to 5 meshed nodes — pool compute & RAM",
      "P2P mesh clustering across your devices",
      "Publish signed skills to the registry",
      "Turnkey connectors + hosted skill sync",
      "Priority bootstrap & relay for hole-punching",
      "Email support",
    ],
  },
  {
    name: "Builder",
    layer: "Mesosphere",
    price: "$100",
    cadence: "/mo",
    tagline: "Power tier (Max) — the biggest models, the full skill library.",
    cta: { label: "Start Builder", href: "mailto:hello@efficientlabs.ai?subject=Builder%20(Max)%20early%20access" },
    features: [
      "Higher node limits — build a real personal mesh",
      "Priority scheduling for the largest local models",
      "The full federated skill library + publishing",
      "Local RAG + curated, optimized model weights",
      "Priority support",
    ],
  },
  {
    name: "Team",
    layer: "Thermosphere",
    price: "$30",
    cadence: "/seat·mo",
    tagline: "One mesh across the whole team's hardware.",
    cta: { label: "Start Team", href: "mailto:hello@efficientlabs.ai?subject=Team%20early%20access" },
    features: [
      "Everything in Builder",
      "Multi-user mesh orchestration (min. 5 seats)",
      "Shared skills, connectors & RAG across devices",
      "Role-based access control + audit logs",
      "SSO / SCIM · business & policy controls",
    ],
  },
  {
    name: "Enterprise",
    layer: "Exosphere",
    price: "Custom",
    tagline: "The edge of space — compliance, air-gap, total control.",
    cta: { label: "Contact sales", href: "mailto:hello@efficientlabs.ai?subject=Enterprise%20early%20access" },
    features: [
      "Everything in Team",
      "On-prem & air-gapped private mesh",
      "HIPAA / SOC 2 / data-residency support",
      "Private capability registry + commercial license",
      "SLAs · dedicated engineering · red-team review",
    ],
  },
];

export default function Pricing() {
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
          <ActHeader index="—" kicker="Pricing" title={<>Own it. <span className="aurora-text">No meter</span>, ever.</>}>
            Flat pricing for software you run on your own hardware. We never bill per token, per
            request, or per gigabyte of egress — because nothing leaves your machine unless you send it.
            Sovereignty is always free; you only ever pay for convenience and borrowed mesh compute.
          </ActHeader>
        </div>

        {/* Responsive: 1 col (mobile) → 2 (sm) → 3 (lg) → 5 (2xl). The featured
            tier spans full-width visually via ring; all cards equal-height. */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {TIERS.map((t, i) => (
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
                  <span className="display text-[2.1rem] text-[color:var(--color-ink)]">{t.price}</span>
                  {t.cadence && <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">{t.cadence}</span>}
                </div>
                <p className="mt-2 min-h-[2.4rem] text-[12.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{t.tagline}</p>

                <a href={t.cta.href}
                   className={`mt-5 ${t.featured ? "btn-signal" : "btn-outline"} justify-center text-center text-[13px]`}>
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

                {/* Wallet + contribution tracking — present on EVERY tier (§11),
                    payouts explicitly NOT live. No crypto/SOL/payout claims. */}
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
          ))}
        </div>

        <p className="mono mt-10 text-center text-[12px] text-[color:var(--color-ink-faint)]">
          No per-token billing · no egress fees · no lock-in · cancel by deleting a folder.
          <br />
          Draft pricing in USD — tiers open at launch. Contribution tracking is active across all
          tiers; the rewards / payout layer is not live (counsel-gated, no return promised).
        </p>
      </div>
    </section>
  );
}
