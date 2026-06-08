"use client";
import { Cpu, Boxes, Sparkles, Radio } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import OsCard from "./OsCard";
import StatusChip from "./StatusChip";
import { capLevel, type StatusLevel } from "@/data/docs";

/**
 * AdvancedControls — the deeper, honest controls revealed by Advanced mode.
 *
 * Every control's chip comes from data/status.json via capLevel(), so this panel
 * can NEVER claim a capability is further along than the matrix says. Where the
 * backend isn't wired the row shows a "Preview" UI-state pill and an honest
 * "not configurable yet" note; where it IS live/wired the row shows that real
 * level. No values are fabricated — these are config affordances, not live data.
 *
 * Grouped: Agent config · Node / mesh detail · Skill management · Model routing.
 */
export default function AdvancedControls({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faint)]">
          Advanced controls
        </p>
        <StatusChip
          tone={signedIn ? "coming" : "preview"}
          label={signedIn ? "Config writes coming soon" : "Preview"}
          size="sm"
        />
      </div>
      <p className="max-w-2xl text-[12.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
        Deeper controls for power users. Each row is gated to the truth: a real
        status badge where the capability is live or wired, and a Preview pill
        where the backend isn&apos;t exposed for configuration yet. Nothing here
        shows fabricated values.
      </p>

      {GROUPS.map((group) => (
        <section key={group.title} className="space-y-3">
          <div className="flex items-center gap-2">
            <group.icon size={14} className="text-[color:var(--color-signal)]" />
            <h3 className="text-[13.5px] font-semibold text-[color:var(--color-ink)]">
              {group.title}
            </h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {group.rows.map((row) => (
              <ControlRow key={row.name} {...row} signedIn={signedIn} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/**
 * One advanced control. If `capName` resolves in status.json we show that real
 * level and (only for live/wired) offer the affordance as a disabled, honestly
 * labeled "Config coming soon" control. Otherwise it's a Preview row.
 */
function ControlRow({
  name,
  detail,
  capName,
  signedIn,
}: {
  name: string;
  detail: string;
  capName?: string;
  signedIn: boolean;
}) {
  const level: StatusLevel | null = capName ? capLevel(capName) : null;
  const isReal = level === "live" || level === "wired";

  return (
    <OsCard variant="data" className="!p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-[color:var(--color-ink)]">{name}</p>
          <p className="mono mt-0.5 text-[11px] leading-relaxed text-[color:var(--color-ink-faint)]">
            {detail}
          </p>
        </div>
        {level ? (
          <StatusChip level={level} />
        ) : (
          <StatusChip tone={signedIn ? "coming" : "preview"} />
        )}
      </div>
      <div className="mt-3">
        <span
          className="mono inline-flex cursor-not-allowed items-center gap-1.5 rounded-[var(--radius-sm)] border border-dashed border-[color:var(--color-line)] px-2.5 py-1.5 text-[10.5px] uppercase tracking-wider text-[color:var(--color-ink-faint)]"
          title={
            isReal
              ? "This capability is real; in-app configuration is not exposed yet."
              : "Backend not wired for configuration yet."
          }
        >
          {isReal ? "Configure · coming soon" : "Not configurable yet"}
        </span>
      </div>
    </OsCard>
  );
}

type Row = { name: string; detail: string; capName?: string };
type Group = { title: string; icon: LucideIcon; rows: Row[] };

const GROUPS: Group[] = [
  {
    title: "Agent config",
    icon: Cpu,
    rows: [
      {
        name: "Owner-gating policy",
        detail: "Who holds command authority (fails closed by default).",
        capName: "Owner-gating (fail-closed)",
      },
      {
        name: "Self-evolution scope",
        detail: "Narrow-class self-improvement bounds for the agent.",
        capName: "Self-evolution (narrow class)",
      },
      {
        name: "Write-approval loop",
        detail: "402 cost handshake before any outbound action.",
        capName: "Write-approval (402 loop)",
      },
      {
        name: "Channel routing",
        detail: "Per-channel adapter enable/priority across five inboxes.",
        capName: "Channel adapters",
      },
    ],
  },
  {
    title: "Node / mesh detail",
    icon: Boxes,
    rows: [
      {
        name: "Peer discovery",
        detail: "Hyperswarm DHT + hole-punch — no open ports.",
        capName: "Hyperswarm DHT + hole-punch",
      },
      {
        name: "Skill gossip sync",
        detail: "Sealed skills replicated peer-to-peer across your mesh.",
        capName: "Gossip skill-sync",
      },
      {
        name: "Capability sandbox",
        detail: "Per-skill env-scoping + WASI exec isolation.",
        capName: "Exec + WASI sandbox",
      },
      {
        name: "Economic settlement",
        detail: "On-chain contribution settlement — not built yet.",
        capName: "Economic / on-chain settlement",
      },
    ],
  },
  {
    title: "Skill management",
    icon: Sparkles,
    rows: [
      {
        name: "Skill-seal verification",
        detail: "Verify sealed-skill provenance on ingest.",
        capName: "Skill-seal verification on ingest",
      },
      {
        name: "Content pipeline",
        detail: "Content-addressed, hermetic build of skill artifacts.",
        capName: "Content-addressed pipeline",
      },
    ],
  },
  {
    title: "Model routing",
    icon: Radio,
    rows: [
      {
        name: "Local ⇄ cloud routing",
        detail: "Code stays local; complex work routes to cloud via the gate.",
        capName: "Local ⇄ cloud language routing",
      },
      {
        name: "BYOK cost gate",
        detail: "Spend ceiling enforced before any request leaves the machine.",
        capName: "BYOK cost gate",
      },
      {
        name: "Speech & vision routing",
        detail: "STT/TTS + vision model routing — not built yet.",
        capName: "Speech & vision (STT/TTS)",
      },
      {
        name: "Agent-to-agent proxy",
        detail: "ACP proxy for delegating to peer agents — not built yet.",
        capName: "ACP agent-to-agent proxy",
      },
    ],
  },
];
