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
} from "lucide-react";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import StatusChip from "@/components/os/StatusChip";

/**
 * Home — the OS command center. Honest overview: tiles backed by a live/wired
 * cap or static info read normally; everything that would need real account
 * data shows a Preview / empty / zero state — never a fabricated number.
 */
export default function AppHome() {
  const { email, signedIn } = useOs();
  const locked = !signedIn;

  return (
    <div className="space-y-8">
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
          <Link href="/#install" className="btn-outline !px-4 !py-2 text-[12px]">
            <Download size={14} /> Install a node
          </Link>
        }
      />

      {/* Honest overview metrics — no fabricated live data */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatPill
          icon={Cpu}
          label="Active agents"
          value={signedIn ? "Offline" : "—"}
          sub={signedIn ? "no agent connected" : "preview"}
          muted
        />
        <StatPill
          icon={Workflow}
          label="Running workflows"
          value="0"
          sub="none active"
          muted
        />
        <StatPill
          icon={Sparkles}
          label="Skills learned"
          value="—"
          sub="self-evolution · narrow class"
          muted
        />
        <StatPill
          icon={Boxes}
          label="Node status"
          value="0 / 2"
          sub="free tier · no nodes paired"
          muted
        />
        <StatPill
          icon={Bell}
          label="Pending actions"
          value="0"
          sub="approval queue empty"
          muted
        />
        <StatPill
          icon={Award}
          label="Contribution credits"
          value="—"
          sub="payouts not live"
          muted
        />
      </div>

      {/* Real-now informational chips */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <OsCard
          icon={MessageSquare}
          title="Channels"
          stat="5"
          statusLevel="live"
          variant="data"
          footer={
            <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
              Telegram · Discord · Slack · Matrix · Signal
            </span>
          }
        >
          One agent, every inbox. Five channel adapters started by the daemon.
        </OsCard>
        <OsCard
          icon={Radio}
          title="Inference routing"
          statusLevel="live"
          variant="data"
          footer={
            <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
              Local for code · cloud for complex work
            </span>
          }
        >
          Local ⇄ cloud language routing through the BYOK cost gate.
        </OsCard>
        <OsCard
          icon={Wallet}
          title="Contribution"
          variant="data"
          footer={
            <StatusChip level="mock" label="Payouts not live" />
          }
        >
          Contribution tracking active · payouts not live. No figures shown.
        </OsCard>
      </div>

      {/* Module shortcuts */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Modules</h2>
          {locked && <StatusChip tone="preview" />}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <OsCard
              key={m.href}
              href={m.href}
              icon={m.icon}
              title={m.title}
              variant="lm"
            >
              {m.body}
            </OsCard>
          ))}
        </div>
      </section>

      {signedIn && email && (
        <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">
          Signed in as {email} · Sovereign · Free
        </p>
      )}
    </div>
  );
}

const MODULES = [
  { href: "/app/agents", icon: Cpu, title: "Agents", body: "Manage StratosAgent — identity, channels, routing." },
  { href: "/app/workflows", icon: Workflow, title: "Workflows", body: "Capability isolation + the write-approval pipeline." },
  { href: "/app/projects", icon: FolderKanban, title: "Projects", body: "Group agents, skills, and runs into workspaces." },
  { href: "/app/skills", icon: Sparkles, title: "Skills", body: "Sealed, P2P-synced, self-evolving skills." },
  { href: "/app/integrations", icon: Plug, title: "Integrations", body: "Connect Gmail, GitHub, Notion, Slack, Drive…" },
  { href: "/app/memory", icon: Brain, title: "Memory", body: "Sealed agent memory — AES-GCM, keys zeroed." },
  { href: "/app/atmosphere", icon: Boxes, title: "Atmosphere", body: "Your private P2P mesh of paired devices." },
  { href: "/app/wallet", icon: Wallet, title: "Wallet", body: "Reserve contributor identity before rewards." },
  { href: "/app/rewards", icon: Gift, title: "Rewards", body: "Contribution tracking · payouts not live." },
  { href: "/app/settings", icon: Settings, title: "Settings", body: "Account, BYOK keys, owner-gating, vault." },
];
