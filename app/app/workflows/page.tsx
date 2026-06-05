"use client";
import {
  Zap,
  CalendarClock,
  GitFork,
  History,
  Receipt,
  CircleCheck,
  CircleX,
  ShieldCheck,
} from "lucide-react";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import StatusChip from "@/components/os/StatusChip";
import EmptyState from "@/components/os/EmptyState";
import ComingSoon from "@/components/os/ComingSoon";

/**
 * Workflows — the ClickUp-side of the OS: automations, scheduled tasks, pipeline
 * stages, and a run history (completed / failed) with signed receipts.
 *
 * Honest by construction: the approval + receipt primitives are real (status.json),
 * but the orchestration surface is not built yet. No run is ever fabricated — the
 * run history shows an honest empty state, and counts are muted zeros.
 */
export default function WorkflowsPage() {
  const { signedIn } = useOs();
  const locked = !signedIn;

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Workflows"
        title="Automations & runs"
        description="Chain agent steps into automations, schedule them, and watch every run land with a signed receipt. The approval + receipt primitives are real; the orchestration surface is in design — no run is shown until it is real."
        actions={<StatusChip tone="preview" label="Preview" />}
      />

      {/* Run summary — honest muted zeros, never fabricated figures. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Run summary</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill icon={Zap} label="Automations" value="0" sub="none yet" muted />
          <StatPill icon={CalendarClock} label="Scheduled" value="0" sub="none yet" muted />
          <StatPill icon={CircleCheck} label="Completed" value="—" sub="no runs" muted />
          <StatPill icon={CircleX} label="Failed" value="—" sub="no runs" muted />
        </div>
      </section>

      {/* What an automation will be made of. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Building blocks</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <OsCard icon={Zap} title="Automations" variant="data" locked={locked}>
            Trigger an agent step on an event — a message, a webhook, a finished run —
            and let it chain into the next step.
          </OsCard>
          <OsCard icon={CalendarClock} title="Scheduled tasks" variant="data" locked={locked}>
            Run a workflow on a cadence. Nothing fires until you connect and arm a
            schedule.
          </OsCard>
          <OsCard icon={GitFork} title="Pipeline stages" variant="data" locked={locked}>
            Move work through named stages — queued, running, awaiting approval, done —
            so a long task stays legible.
          </OsCard>
        </div>
      </section>

      {/* The honesty bridge: the approval + receipt machinery that real runs ride on. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          What every run rides on
        </h2>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
          When automations ship, each run executes through the same isolation and
          approval primitives the agent already uses — and lands a signed receipt.
          These are real today.
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          <OsCard
            icon={ShieldCheck}
            title="Write-approval gate"
            statusLevel="wired"
            variant="data"
          >
            A cost handshake (the 402 loop) gates any write a workflow attempts. Nothing
            spends or mutates without it.
          </OsCard>
          <OsCard icon={Receipt} title="Post-quantum receipts" statusLevel="live" variant="data">
            Every run can be sealed with an ML-DSA-65 signature, so a completed step is
            verifiable after the fact — not just logged.
          </OsCard>
        </div>
      </section>

      {/* Run history — honest empty surface. No fake runs, ever. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Run history</h2>
        <EmptyState
          icon={History}
          title="No runs yet"
          description="Completed and failed runs — each with its signed receipt — will appear here once an automation is connected and armed. Nothing is shown until a real run happens."
        />
      </section>

      {/* The builder itself isn't built. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Visual builder</h2>
        <ComingSoon
          title="Workflow builder"
          description="A visual editor to compose agent steps, schedules, pipeline stages, and approval gates into a single automation. In design — no nodes are shown until it is real."
        />
      </section>
    </div>
  );
}
