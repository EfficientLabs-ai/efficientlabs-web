"use client";
import Link from "next/link";
import {
  Cpu,
  Workflow,
  Sparkles,
  Boxes,
  Plug,
  Brain,
  Wallet,
  Gift,
  FolderKanban,
  Settings,
  MessageSquare,
  Radio,
  Download,
  Bell,
  Award,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useOs } from "@/components/os/useOsSession";
import { useOsPrefs, isSectionShown, type DashSectionId } from "@/components/os/useOsPrefs";
import ModuleHeader from "@/components/os/ModuleHeader";
import StatCard from "@/components/os/StatCard";
import StatusChip from "@/components/os/StatusChip";
import AdvancedControls from "@/components/os/AdvancedControls";
import type { StatusLevel } from "@/data/docs";

/**
 * Home — the OS command center. Honest overview with a customizable, reorderable
 * band layout: the user chooses (in Settings → Customize) which sections show
 * and in what order (persisted via useOsPrefs). Sections:
 *   (1) Overview — dense StatCard row; every figure that would need real account
 *       data shows "—"/"0" + an honest chip, never a fabricated number or delta.
 *   (2) System  — what's actually live now, status.json-driven.
 *   (3) Modules — compact module grid.
 *   (4) Advanced — deeper preview controls, only when Advanced mode is on.
 * Surfaces are token-driven, so the page reads intentionally in both OS themes
 * AND under any chosen accent/density.
 */
export default function AppHome() {
  const { email, signedIn } = useOs();
  const { prefs } = useOsPrefs();

  // Render sections in the user's chosen order, skipping hidden ones (and the
  // Advanced panel unless Advanced mode is on). isSectionShown centralizes that.
  const sections = prefs.dashOrder.filter((id) => isSectionShown(prefs, id));

  const render: Record<DashSectionId, () => React.ReactNode> = {
    overview: () => <OverviewBand key="overview" signedIn={signedIn} />,
    system: () => <SystemBand key="system" />,
    modules: () => <ModulesBand key="modules" />,
    advanced: () => (
      <section key="advanced" className="space-y-3">
        <AdvancedControls signedIn={signedIn} />
      </section>
    ),
  };

  return (
    <div className="relative space-y-8">
      {/* aurora glows behind the OS cards so their glass material reads */}
      <div aria-hidden className="aurora-field">
        <div className="glow glow-azure -left-10 -top-10 h-[26rem] w-[40rem]" />
        <div className="glow glow-cyan right-0 top-[24rem] h-[24rem] w-[30rem]" />
        <div className="glow glow-violet left-1/3 top-[48rem] h-[26rem] w-[32rem]" />
      </div>
      <div className="relative z-10 space-y-8">
        <ModuleHeader
          kicker="Atmosphere OS"
          title={
            <>
              Your <span className="aurora-text">Atmosphere</span>.
            </>
          }
          description={
            signedIn
              ? "One surface for your agent, mesh, skills, and keys — all sovereign, all on hardware you own."
              : "A preview of your sovereign control plane. Sign in to connect your agent, nodes, and keys."
          }
          actions={
            <div className="flex items-center gap-2">
              <Link
                href="/app/settings#customize"
                className="btn-outline !px-4 !py-2 text-[12px]"
                title="Customize this dashboard"
              >
                <SlidersHorizontal size={14} /> Customize
              </Link>
              <Link href="/#install" className="btn-outline !px-4 !py-2 text-[12px]">
                <Download size={14} /> Install a node
              </Link>
            </div>
          }
        />

        {sections.length === 0 ? (
          <div className="rounded-[var(--radius)] border border-dashed border-[color:var(--color-line)] bg-[color:var(--color-void-2)] px-6 py-12 text-center">
            <p className="text-[14px] font-medium text-[color:var(--color-ink-dim)]">
              All dashboard sections are hidden.
            </p>
            <p className="mono mt-1 text-[12px] text-[color:var(--color-ink-faint)]">
              Re-enable sections in{" "}
              <Link href="/app/settings#customize" className="underline">
                Settings → Customize
              </Link>
              .
            </p>
          </div>
        ) : (
          sections.map((id) => render[id]())
        )}

        {signedIn && email && (
          <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">
            Signed in as {email} · Sovereign · Free
          </p>
        )}
      </div>
    </div>
  );
}

// ── Band 1 — account metrics (honest; no fabricated figures/deltas) ──
function OverviewBand({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faint)]">
          Overview
        </h2>
        <StatusChip
          tone={signedIn ? "coming" : "preview"}
          label={signedIn ? "Live data when connected" : "Preview"}
          size="sm"
        />
      </div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Cpu}
          label="Active agents"
          value={signedIn ? "Offline" : "—"}
          statusLabel="no agent connected"
          muted
        />
        <StatCard icon={Workflow} label="Running workflows" value="0" statusLabel="none active" muted />
        <StatCard icon={Boxes} label="Nodes paired" value="0 / 2" statusLabel="free tier" muted />
        <StatCard icon={Bell} label="Pending actions" value="0" statusLabel="queue empty" muted />
        <StatCard icon={Sparkles} label="Skills learned" value="—" statusLabel="not measured" muted />
        <StatCard
          icon={Award}
          label="Contribution credits"
          value="—"
          statusLevel="mock"
          statusLabel="Payouts not live"
          muted
        />
      </div>
    </section>
  );
}

// ── Band 2 — System: what's actually live now ──
function SystemBand() {
  return (
    <section className="space-y-3">
      <h2 className="mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faint)]">
        System
      </h2>
      <div className="overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]">
        {SYSTEM_ROWS.map((row, i) => (
          <div
            key={row.title}
            className={
              "flex items-center gap-3 px-4 py-3" +
              (i > 0 ? " border-t border-[color:var(--color-line)]" : "")
            }
          >
            <div className="glass grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[color:var(--color-signal)]">
              <row.icon size={15} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-[color:var(--color-ink)]">{row.title}</p>
              <p className="mono truncate text-[11px] text-[color:var(--color-ink-faint)]">
                {row.detail}
              </p>
            </div>
            {row.level ? (
              <StatusChip level={row.level} label={row.chipLabel} size="sm" />
            ) : (
              <StatusChip tone="coming" label={row.chipLabel} size="sm" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Band 3 — modules ──
function ModulesBand() {
  return (
    <section className="space-y-3">
      <h2 className="mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faint)]">
        Modules
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group flex items-start gap-3 rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)] p-4 transition-colors hover:border-[color:var(--color-signal)]/30"
          >
            <div className="glass grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[color:var(--color-signal)]">
              <m.icon size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-[13.5px] font-semibold text-[color:var(--color-ink)]">
                {m.title}
                <ArrowRight
                  size={13}
                  className="text-[color:var(--color-ink-faint)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                />
              </p>
              <p className="mt-0.5 text-[12.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
                {m.body}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/** Live-now system rows — every entry is backed by a real status.json level. */
type SystemRow = {
  icon: LucideIcon;
  title: string;
  detail: string;
  level: StatusLevel;
  chipLabel?: string;
};
const SYSTEM_ROWS: SystemRow[] = [
  {
    icon: MessageSquare,
    title: "Channels",
    detail: "Telegram · Discord · Slack · Matrix · Signal",
    level: "live" as const,
    chipLabel: undefined,
  },
  {
    icon: Radio,
    title: "Inference routing",
    detail: "Local for code · cloud for complex work · cost gate on your own accounts",
    level: "live" as const,
    chipLabel: undefined,
  },
  {
    icon: Boxes,
    title: "Atmosphere mesh",
    detail: "Hyperswarm DHT + hole-punch · no open ports",
    level: "wired" as const,
    chipLabel: undefined,
  },
  {
    icon: Award,
    title: "Contribution",
    detail: "Tracking active · payouts not live · no figures shown",
    level: "mock" as const,
    chipLabel: "Payouts not live",
  },
];

const MODULES = [
  { href: "/app/agents", icon: Cpu, title: "Agents", body: "StratosAgent — identity, channels, routing." },
  { href: "/app/workflows", icon: Workflow, title: "Workflows", body: "Capability isolation + write-approval pipeline." },
  { href: "/app/projects", icon: FolderKanban, title: "Projects", body: "Group agents, skills, and runs into workspaces." },
  { href: "/app/skills", icon: Sparkles, title: "Skills", body: "Sealed, P2P-synced, self-evolving skills." },
  { href: "/app/integrations", icon: Plug, title: "Integrations", body: "Connect Gmail, GitHub, Notion, Slack, Drive…" },
  { href: "/app/memory", icon: Brain, title: "Memory", body: "Sealed agent memory — AES-GCM, keys zeroed." },
  { href: "/app/atmosphere", icon: Boxes, title: "Atmosphere", body: "Your private P2P mesh of paired devices." },
  { href: "/app/wallet", icon: Wallet, title: "Wallet", body: "Reserve contributor identity before rewards." },
  { href: "/app/rewards", icon: Gift, title: "Rewards", body: "Contribution credits — tracked, payouts not live." },
  { href: "/app/settings", icon: Settings, title: "Settings", body: "Customize, account, your AI provider keys, owner-gating." },
];
