"use client";
import { Check, Minus } from "lucide-react";
import { Reveal, ActHeader } from "@/components/Reveal";

type Tier = {
  name: string;
  price: string;
  cadence?: string;
  tagline: string;
  cta: { label: string; href: string };
  featured?: boolean;
  features: string[];
};

// DRAFT pricing — flat, NEVER metered. Gated on meshed-node count, not usage.
// Numbers pending operator approval (informed by positioning-research.md).
const TIERS: Tier[] = [
  {
    name: "Sovereign",
    price: "Free",
    tagline: "Run it on your own hardware, forever.",
    cta: { label: "Install now", href: "/#install" },
    features: [
      "Up to 2 nodes (e.g. your laptop + phone)",
      "The Atmosphere runtime + StratosAgent",
      "Runs in your own terminal — no cloud, no VPS",
      "Bring your own model (local + frontier keys)",
      "Content-addressed · post-quantum",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    cadence: "/mo",
    tagline: "Pool your devices into one private mesh.",
    cta: { label: "Start Pro", href: "mailto:hello@efficientlabs.ai?subject=Pro%20early%20access" },
    featured: true,
    features: [
      "Up to 5 meshed nodes — pool compute & RAM",
      "P2P mesh clustering across your devices",
      "Skill registry + signed skill publishing",
      "Curated, optimized model weights + local RAG",
      "Priority bootstrap & relay for hole-punching",
      "Email support",
    ],
  },
  {
    name: "Team",
    price: "$49",
    cadence: "/seat·mo",
    tagline: "One mesh across the whole team's hardware.",
    cta: { label: "Start Team", href: "mailto:hello@efficientlabs.ai?subject=Team%20early%20access" },
    features: [
      "Everything in Pro",
      "Multi-user mesh orchestration",
      "Shared context & RAG across team devices",
      "Role-based access control + audit logs",
      "SSO / SCIM",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    tagline: "Compliance, air-gap, and an audit.",
    cta: { label: "Contact sales", href: "mailto:hello@efficientlabs.ai?subject=Enterprise%20%2B%20Sovereignty%20Audit" },
    features: [
      "Everything in Team",
      "HIPAA / SOC2 / data-residency support",
      "On-prem & air-gapped deployment",
      "AI Sovereignty Audit ($797 / $1,497 / Bespoke)",
      "SLAs + dedicated engineering",
      "Security review & red-team",
    ],
  },
];

export default function Pricing() {
  return (
    <section className="relative pt-36 pb-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-[30rem] w-[46rem] -translate-x-1/2 rounded-full opacity-[0.12] blur-[130px]"
             style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <ActHeader index="—" kicker="Pricing" title={<>Own it. <span className="aurora-text">No meter</span>, ever.</>}>
            Flat pricing for software you run on your own hardware. We never bill per token, per
            request, or per gigabyte of egress — because nothing leaves your machine unless you send it.
          </ActHeader>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-4">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={0.05 * i}>
              <div className={`lm-card is-interactive relative flex h-full flex-col p-6 ${t.featured ? "ring-1 ring-[color:var(--color-signal)]/40" : ""}`}>
                {t.featured && (
                  <span className="mono absolute -top-2.5 left-6 rounded-full border border-[color:var(--color-signal)]/40 bg-[color:var(--color-signal)]/15 px-2.5 py-0.5 text-[10px] tracking-wider text-[color:var(--color-signal)]">
                    MOST POPULAR
                  </span>
                )}
                <h3 className="display text-[1.3rem] text-[color:var(--color-ink)]">{t.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="display text-[2.4rem] text-[color:var(--color-ink)]">{t.price}</span>
                  {t.cadence && <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">{t.cadence}</span>}
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">{t.tagline}</p>

                <a href={t.cta.href}
                   className={`mt-6 ${t.featured ? "btn-signal" : "btn-outline"} justify-center text-center`}>
                  {t.cta.label}{t.featured && <span aria-hidden>→</span>}
                </a>

                <ul className="mt-7 space-y-2.5">
                  {t.features.map((f, fi) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] leading-snug text-[color:var(--color-ink-dim)]">
                      {fi === 0 && i > 0
                        ? <Minus size={14} className="mt-0.5 shrink-0 text-[color:var(--color-ink-faint)]" />
                        : <Check size={14} className="mt-0.5 shrink-0 text-[color:var(--color-signal)]" />}
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mono mt-10 text-center text-[12px] text-[color:var(--color-ink-faint)]">
          No per-token billing · no egress fees · no lock-in · cancel by deleting a folder.
          <br />Prices in USD. Early access — tiers open at launch.
        </p>
      </div>
    </section>
  );
}
