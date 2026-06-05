"use client";
import Link from "next/link";
import {
  Cpu,
  Radio,
  Network,
  History,
  MessageSquare,
  Send,
  Bot,
  ShieldCheck,
  Workflow,
  Lock,
} from "lucide-react";
import { CapStatus } from "@/components/docs/StatusBadge";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import StatusChip from "@/components/os/StatusChip";
import EmptyState from "@/components/os/EmptyState";

/**
 * Agents — chat-with-your-agent (StratosAgent) + the agent-to-agent
 * coordination log.
 *
 * Honesty: the StratosAgent daemon runs on the USER's own machine, so this web
 * surface can never hold a live conversation. When not connected we show a
 * Preview / "connect your StratosAgent" state and never fabricate a transcript.
 * Agent-to-agent (ACP) is mock per status.json — labelled as such, no fake feed.
 */
export default function AgentsPage() {
  const { signedIn } = useOs();
  const locked = !signedIn;

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Agents"
        title="StratosAgent"
        statusLevel="live"
        description="Your agent runs as a daemon on hardware you own. This page is a remote control surface — the conversation itself lives on your machine, not on our servers. Identity, channels, and routing are live; speech/vision and agent-to-agent are scaffolds today."
        actions={
          <Link href="/#install" className="btn-outline !px-4 !py-2 text-[12px]">
            <Cpu size={14} /> Install the daemon
          </Link>
        }
      />

      {/* Honest snapshot — no fabricated live numbers */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill
          icon={Cpu}
          label="Daemon status"
          value={signedIn ? "Offline" : "—"}
          sub={signedIn ? "no agent connected" : "preview"}
          muted
        />
        <StatPill icon={Radio} label="Channels" value="5" sub="adapters · daemon-started" />
        <StatPill icon={Network} label="Peer agents" value="0" sub="none paired" muted />
        <StatPill icon={Workflow} label="Active tasks" value="0" sub="queue empty" muted />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OsCard icon={Cpu} title="Agent identity" variant="data" locked={locked}>
          A single sovereign agent, owner-gated and keyed to your machine.
        </OsCard>
        <OsCard icon={Radio} title="Inference routing" statusLevel="live" variant="data">
          Local ⇄ cloud language routing — coding stays local, complex work proxies out
          through the BYOK cost gate.
        </OsCard>
      </div>

      {/* Chat surface — Preview when not connected; never a fake transcript */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Chat with your agent
          </h2>
          {!signedIn && <StatusChip tone="preview" />}
        </div>

        <div className="data-card flex flex-col overflow-hidden !p-0">
          {/* Conversation header */}
          <div className="flex items-center justify-between gap-3 border-b border-[color:var(--color-line)] px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="glass grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[color:var(--color-ink-dim)]">
                <Bot size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] text-[color:var(--color-ink)]">StratosAgent</p>
                <p className="mono truncate text-[11px] text-[color:var(--color-ink-faint)]">
                  {signedIn ? "no daemon reachable" : "preview — sign in to connect"}
                </p>
              </div>
            </div>
            <StatusChip level="live" label="Owner-gated" />
          </div>

          {/* Empty conversation body — honest, never fabricated */}
          <div className="px-4 py-8 sm:px-5">
            <EmptyState
              icon={MessageSquare}
              title={signedIn ? "No conversation yet" : "Connect your StratosAgent"}
              description={
                signedIn
                  ? "Your agent daemon isn't reachable from here. Start it on your own machine, then this surface controls it over your private mesh."
                  : "The agent runs on hardware you own — its conversation never lives on our servers. Sign in and pair your daemon to talk to it from here."
              }
              action={
                signedIn ? (
                  <Link href="/#install" className="btn-outline !px-4 !py-2 text-[12px]">
                    <Cpu size={14} /> Install the daemon
                  </Link>
                ) : (
                  <Link href="/login" className="btn-outline !px-4 !py-2 text-[12px]">
                    <Lock size={14} /> Sign in to connect
                  </Link>
                )
              }
            />
          </div>

          {/* Disabled composer — honestly inert until a daemon is paired */}
          <div className="border-t border-[color:var(--color-line)] px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 px-3.5 py-2.5 opacity-60">
              <input
                disabled
                aria-label="Message your agent (connect a daemon to enable)"
                placeholder="Pair a daemon to message your agent…"
                className="mono min-w-0 flex-1 bg-transparent text-[13px] text-[color:var(--color-ink-dim)] placeholder:text-[color:var(--color-ink-faint)] focus:outline-none"
              />
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[color:var(--color-ink-faint)]">
                <Send size={15} />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Agent coordination log — agent-to-agent (ACP is mock per status.json) */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Agent coordination log
          </h2>
          <StatusChip capName="ACP agent-to-agent proxy" />
        </div>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
          When agents collaborate, every hand-off is recorded here — the agent and its
          role, the task in flight, the tools it was allowed, and the policy that gated it.
          The agent-to-agent proxy currently returns scaffolded responses, so no real
          coordination is shown yet.
        </p>

        {/* Schema preview — the shape of a coordination entry, marked as preview */}
        <OsCard variant="data">
          <div className="grid gap-3 sm:grid-cols-2">
            {COORD_SCHEMA.map((row) => (
              <div
                key={row.field}
                className="flex flex-col gap-0.5 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/40 px-3.5 py-2.5"
              >
                <span className="mono text-[10.5px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
                  {row.field}
                </span>
                <span className="text-[13px] text-[color:var(--color-ink-dim)]">{row.example}</span>
              </div>
            ))}
          </div>
          <p className="mono mt-4 text-[11px] text-[color:var(--color-ink-faint)]">
            Schema preview · values shown are field examples, not a live exchange.
          </p>
        </OsCard>

        <EmptyState
          icon={Network}
          title="No coordination yet"
          description="Once the agent-to-agent proxy ships and a peer agent is paired, hand-offs will stream in here with full role, task, tool and policy context."
        />
      </section>

      {/* Honest capability surface */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Live capabilities</h2>
        <div className="space-y-2.5">
          <CapStatus name="Five channel adapters" />
          <CapStatus name="Local ⇄ cloud language routing" />
          <CapStatus name="BYOK cost gate" />
          <CapStatus name="Owner-gating (fail-closed)" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Advanced (scaffold)</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <OsCard icon={ShieldCheck} title="Capability isolation" statusLevel="wired" variant="data">
            Children and sidecars are stripped of secrets before any tool runs — broker
            env-scoping plus an exec + WASI sandbox. Hardening in progress.
          </OsCard>
          <OsCard icon={Network} title="Agent-to-agent (ACP)" statusLevel="mock" variant="data">
            The ACP proxy returns scaffolded responses. Not a working inter-agent protocol
            yet.
          </OsCard>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Run history</h2>
        <EmptyState
          icon={History}
          title="No runs yet"
          description="Connect your agent to see recent runs and the cost-approval queue here."
        />
      </section>
    </div>
  );
}

/** Field examples for a coordination-log entry — clearly a schema, not data. */
const COORD_SCHEMA = [
  { field: "Agent", example: "StratosAgent · planner" },
  { field: "Role", example: "Orchestrator" },
  { field: "Current task", example: "—" },
  { field: "Connected tools", example: "—" },
  { field: "Policy", example: "Owner-gated · write-approval" },
  { field: "Last hand-off", example: "—" },
];
