import {
  LayoutDashboard,
  Activity,
  FileCheck2,
  Terminal,
  Network,
  Wallet,
  Settings,
} from "lucide-react";
import Aurora from "@/components/glass/Aurora";
import GlassCard from "@/components/glass/GlassCard";
import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/Reveal";
import { VERDICT } from "@/components/proof/palette";

/**
 * THE NODE CONSOLE — a glass PREVIEW of the node-served console. This is a
 * product showcase, not a live dashboard: it represents STRUCTURE and qualitative
 * states (paired, verified ✓, GREEN/null dots, illustrative DID hashes) and
 * deliberately fabricates NO live numbers (no CPU %, latency ms, uptime). The
 * "preview" framing is explicit in the chrome so nothing here reads as a claim.
 * Server-rendered; the only motion is the house Reveal (transform/opacity).
 */

const NAV = [
  { icon: LayoutDashboard, label: "Console", active: true },
  { icon: Activity, label: "Live ARI" },
  { icon: FileCheck2, label: "Receipts" },
  { icon: Terminal, label: "Terminal" },
  { icon: Network, label: "Nodes" },
  { icon: Wallet, label: "Commerce" },
  { icon: Settings, label: "Settings" },
];

// Representative readiness rows — qualitative dots only, no scores.
const READINESS: { name: string; state: "green" | "null" }[] = [
  { name: "Runtime", state: "green" },
  { name: "Continuity", state: "green" },
  { name: "Ownership", state: "green" },
  { name: "Governance", state: "null" },
];

// Representative receipt rows — action · ref · verified. Refs are illustrative.
const RECEIPTS = [
  { action: "route.delegate", ref: "rcp_9f2c…", verified: true },
  { action: "memory.write", ref: "rcp_41ad…", verified: true },
  { action: "skill.exec", ref: "rcp_0b7e…", verified: true },
];

function DotState({ state }: { state: "green" | "null" }) {
  return (
    <span
      aria-hidden
      className="h-2 w-2 shrink-0 rounded-full"
      style={
        state === "green"
          ? { background: VERDICT.GREEN }
          : { background: "transparent", border: "1px solid #5b6675" }
      }
    />
  );
}

export default function NodeConsole() {
  return (
    <section
      id="node-console"
      className="section section-t relative overflow-hidden scroll-mt-20"
    >
      <Aurora variant="left" />
      <div className="container-x relative">
        <div className="max-w-2xl">
          <KickerLabel index="—" text="The node console" />
          <SplitHeading as="h2" className="t-section mt-6">
            Your sovereign node, <span className="aurora-text">in one console</span>.
          </SplitHeading>
          <Reveal delay={0.16}>
            <p className="t-body-lg mt-7 max-w-2xl text-[color:var(--color-ink-dim)]">
              It runs on 127.0.0.1, served by the node you own — readiness, receipts, and
              commerce in one place. Here&apos;s a preview of what that console shows.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          {/* The console "window" — a feature glass surface framed as a preview. */}
          <GlassCard className="overflow-hidden p-0">
            {/* window chrome bar — three dots + the preview label, never "live" */}
            <div className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-3">
              <span className="flex items-center gap-1.5" aria-hidden>
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-edge)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-edge)]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--color-edge)]" />
              </span>
              <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
                node://127.0.0.1 · console
              </span>
              <span className="mono ml-auto rounded-[var(--radius-pill)] border border-[color:var(--color-edge)] px-2 py-0.5 text-[10px] tracking-[0.16em] text-[color:var(--color-ink-faint)]">
                PREVIEW
              </span>
            </div>

            {/* body: left rail + main panel — stacks on mobile */}
            <div className="flex flex-col sm:flex-row">
              {/* left rail */}
              <nav
                aria-label="Console preview navigation"
                className="flex shrink-0 gap-1 overflow-x-auto border-b border-[color:var(--color-line)] p-3 sm:w-48 sm:flex-col sm:overflow-visible sm:border-b-0 sm:border-r"
              >
                {NAV.map((item) => (
                  <span
                    key={item.label}
                    aria-current={item.active ? "page" : undefined}
                    className={`mono flex shrink-0 items-center gap-2.5 rounded-[var(--radius-sm)] px-3 py-2 text-[12px] ${
                      item.active
                        ? "bg-[color:color-mix(in_oklab,var(--color-signal)_12%,transparent)] text-[color:var(--color-ink)]"
                        : "text-[color:var(--color-ink-faint)]"
                    }`}
                  >
                    <item.icon
                      size={15}
                      aria-hidden
                      className={item.active ? "text-[color:var(--color-signal)]" : ""}
                    />
                    {item.label}
                  </span>
                ))}
              </nav>

              {/* main panel — three representative sub-panels as glass tiles */}
              <div className="grid flex-1 grid-cols-1 gap-3 p-4 lg:grid-cols-2">
                {/* Node status tile */}
                <GlassCard material="flat" className="p-4 lg:col-span-2">
                  <span className="mono text-[10px] tracking-[0.18em] text-[color:var(--color-ink-faint)]">
                    NODE STATUS
                  </span>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                    <span className="mono text-[13px] text-[color:var(--color-ink)]">
                      did:atmos:7f3a…
                    </span>
                    <span className="mono inline-flex items-center gap-2 text-[12px] text-[color:var(--color-ink-dim)]">
                      <span
                        aria-hidden
                        className="h-2 w-2 rounded-full"
                        style={{ background: VERDICT.GREEN }}
                      />
                      paired · owner-bound
                    </span>
                    <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">
                      region: self-hosted
                    </span>
                  </div>
                </GlassCard>

                {/* Live readiness tile */}
                <GlassCard material="flat" className="p-4">
                  <span className="mono text-[10px] tracking-[0.18em] text-[color:var(--color-ink-faint)]">
                    LIVE READINESS
                  </span>
                  <ul className="mt-3 space-y-2">
                    {READINESS.map((r) => (
                      <li
                        key={r.name}
                        className="flex items-center justify-between gap-3 text-[12.5px] text-[color:var(--color-ink-dim)]"
                      >
                        <span className="flex items-center gap-2.5">
                          <DotState state={r.state} />
                          {r.name}
                        </span>
                        <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
                          {r.state === "green" ? "measured" : "not yet wired"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>

                {/* Receipts tile */}
                <GlassCard material="flat" className="p-4">
                  <span className="mono text-[10px] tracking-[0.18em] text-[color:var(--color-ink-faint)]">
                    RECEIPTS
                  </span>
                  <ul className="mt-3 space-y-2">
                    {RECEIPTS.map((row) => (
                      <li
                        key={row.ref}
                        className="flex items-center justify-between gap-3 text-[12.5px]"
                      >
                        <span className="mono text-[color:var(--color-ink-dim)]">{row.action}</span>
                        <span className="flex items-center gap-2">
                          <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
                            {row.ref}
                          </span>
                          <span
                            className="mono text-[12px]"
                            style={{ color: VERDICT.GREEN }}
                            aria-label="verified"
                          >
                            ✓
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </GlassCard>
              </div>
            </div>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
