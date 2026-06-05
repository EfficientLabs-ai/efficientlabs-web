"use client";
import Link from "next/link";
import {
  Gift,
  Activity,
  Clock,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { CapStatus } from "@/components/docs/StatusBadge";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import EmptyState from "@/components/os/EmptyState";
import StatusChip from "@/components/os/StatusChip";

/**
 * Rewards — contribution tracking surface.
 *
 * Honesty discipline (HARD): reward state is exactly "Contribution tracking
 * active · Payouts not live". No currency or token figure appears anywhere, and
 * none of the prohibited reward/earning/return claims are used. Every metric
 * that would need a real source is muted "—" / "0" with an honest sub-label —
 * never a fabricated number.
 */
export default function RewardsPage() {
  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Rewards"
        title={
          <>
            Contribution <span className="aurora-text">tracking</span>
          </>
        }
        actions={<StatusChip level="mock" label="Payouts not live" />}
        description="Contribution tracking active · Payouts not live. We track your eligible contribution now; there is no payout path yet, and no amount or value is shown."
      />

      {/* Reward state banner */}
      <OsCard icon={Activity} title="Reward state" variant="data">
        Contribution tracking active · Payouts not live. When settlement is real, eligible
        contribution will be reflected here honestly — with no projections, no amounts, and
        no value implied.
      </OsCard>

      {/* Tracked contribution — every figure muted, never fabricated */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Tracked contribution
          </h2>
          <StatusChip tone="preview" label="No source yet" size="sm" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatPill icon={Gift} label="Contribution Credits" value="—" sub="no source yet" muted />
          <StatPill icon={Clock} label="Eligible node-hours" value="0" sub="no node online" muted />
          <StatPill icon={CheckCircle2} label="Verified jobs" value="0" sub="none verified yet" muted />
          <StatPill icon={Sparkles} label="Skills published" value="0" sub="none published yet" muted />
          <StatPill icon={Sparkles} label="Skills reused" value="0" sub="no reuse recorded" muted />
          <StatPill icon={ShieldCheck} label="Reliability" value="—" sub="no completed jobs" muted />
        </div>
      </section>

      {/* Honest empty surface where credits would appear */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Contribution Credits
        </h2>
        <EmptyState
          icon={Gift}
          title="Tracking begins when you connect a wallet"
          description="Reserve a contributor identity to start tracking eligible Contribution Credits, node-hours, verified jobs, and reliability. No amounts or values are shown until there is a real source."
          action={
            <Link href="/app/wallet" className="btn-outline !px-4 !py-2 text-[12px]">
              Connect wallet →
            </Link>
          }
        />
      </section>

      {/* How contribution is counted — measurement before attribution */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          How contribution is counted
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <OsCard icon={Clock} title="Eligible node-hours" variant="data">
            Time a paired node spends available to the mesh. Measured first; attribution
            only follows real, verified availability.
          </OsCard>
          <OsCard icon={CheckCircle2} title="Verified jobs" variant="data">
            Jobs a node actually completed for peers, checked against post-quantum receipts —
            not self-reported.
          </OsCard>
          <OsCard icon={Sparkles} title="Skills published &amp; reused" variant="data">
            Skills you publish to the mesh and how often peers reuse them, tracked with
            sealed provenance.
          </OsCard>
        </div>
      </section>

      {/* Settlement status */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Settlement</h2>
        <div className="space-y-2.5">
          <CapStatus name="Economic / on-chain settlement" />
        </div>
        <p className="mono text-[12px] text-[color:var(--color-ink-faint)]">
          Contribution tracking active · Payouts not live
        </p>
      </section>
    </div>
  );
}
