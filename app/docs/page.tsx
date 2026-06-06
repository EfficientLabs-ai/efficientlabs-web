import type { Metadata } from "next";
import {
  Rocket,
  TerminalSquare,
  Network,
  Plug,
  SquareTerminal,
  Wallet,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import { NAV, getArticle } from "@/data/docs";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Start here. Documentation for StratosAgent and the Atmosphere — sovereign, local-first AI you run on hardware you own.",
  alternates: { canonical: "/docs" },
};

const GROUP_META: Record<string, { icon: typeof Rocket; blurb: string }> = {
  "Get started": { icon: Rocket, blurb: "The thesis, a two-command quickstart, and the core concepts." },
  "Install StratosAgent": { icon: TerminalSquare, blurb: "Requirements, install, Vault + BYOK config, and verification." },
  "The Atmosphere": { icon: Network, blurb: "The peer-to-peer mesh: transport, skill-sync, and settlement." },
  "Integrations": { icon: Plug, blurb: "Channels, inference routing, and what is still a scaffold." },
  "CLI reference": { icon: SquareTerminal, blurb: "Command groups, flags, and per-command usage." },
  "Economy": { icon: Wallet, blurb: "Wallet connect + Contribution Credits. Tracking is active; payouts are not live." },
  "FAQ": { icon: HelpCircle, blurb: "Straight answers about what is real today." },
};

export default function DocsIndex() {
  return (
    <>
      {/* content column */}
      <div id="docs-content" className="min-w-0 py-8 lg:py-10">
        <DocsBreadcrumb crumbs={[{ label: "Docs" }]} />
        <header className="mt-4 max-w-[46rem]">
          <p className="kicker">Documentation</p>
          <h1 className="t-section mt-3">
            Build on <span className="aurora-text">sovereign</span> infrastructure.
          </h1>
          <p className="t-body-lg mt-4 text-[color:var(--color-ink-dim)]">
            StratosAgent runs on hardware you own; the Atmosphere meshes it with the world. These docs
            label every capability with its honest status — Live, Wired, Standalone, or Mock — so you
            always know what is real today.
          </p>
        </header>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {NAV.map((group) => {
            const meta = GROUP_META[group.label];
            const Icon = meta?.icon ?? Rocket;
            const first = group.slugs[0];
            const firstArticle = getArticle(first);
            return (
              <a
                key={group.label}
                href={`/docs/${first}`}
                className="lm-card is-interactive group flex flex-col gap-3 p-5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/25 bg-[color:var(--color-signal)]/[0.07] text-[color:var(--color-signal)]">
                  <Icon size={18} aria-hidden />
                </span>
                <div>
                  <h2 className="t-card flex items-center gap-1.5">
                    {group.label}
                    <ArrowRight
                      size={15}
                      aria-hidden
                      className="text-[color:var(--color-ink-faint)] transition-transform group-hover:translate-x-1 group-hover:text-[color:var(--color-signal)]"
                    />
                  </h2>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
                    {meta?.blurb ?? firstArticle?.description}
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* empty TOC slot keeps the 3-col grid aligned on lg */}
      <div className="hidden lg:block" aria-hidden />
    </>
  );
}
