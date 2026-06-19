"use client";
import Link from "next/link";
import {
  Boxes,
  Share2,
  MonitorSmartphone,
  Cpu,
  Gauge,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Clock,
  Activity,
} from "lucide-react";
import { CapStatus } from "@/components/docs/StatusBadge";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import StatusChip from "@/components/os/StatusChip";
import EmptyState from "@/components/os/EmptyState";

/**
 * Atmosphere — the node dashboard for your private P2P mesh.
 *
 * Honesty discipline: the mesh transport is Wired per status.json (built and
 * connected, broad multi-device runs still early), so the page presents a
 * Preview / connect state. There is NO fabricated node count, compute figure,
 * job count, uptime, or reliability number — every metric that would need a
 * real paired node renders muted with "—" / "0" and an honest sub-label.
 */
export default function AtmospherePage() {
  const { signedIn } = useOs();
  const locked = !signedIn;

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Atmosphere"
        title={
          <>
            Your private <span className="aurora-text">mesh</span>
          </>
        }
        statusLevel="wired"
        description="A peer-to-peer mesh over a Hyperswarm DHT with hole-punching — no open ports, nothing exposed to the public internet. Per-platform node bundles are built and connected; broad multi-device runs are still early, so no live node figures are shown until a real device is paired."
        actions={
          <Link href="/install" className="btn-outline !px-4 !py-2 text-[12px]">
            <ArrowDownToLine size={14} /> Install a node
          </Link>
        }
      />

      {/* This device */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">This device</h2>
          <StatusChip tone="preview" label="Not paired" size="sm" />
        </div>
        <OsCard
          icon={MonitorSmartphone}
          title="This device"
          variant="data"
          locked={locked}
          footer={
            !locked ? (
              <Link href="/install" className="btn-outline !px-4 !py-2 text-[12px]">
                Pair this device →
              </Link>
            ) : undefined
          }
        >
          This browser is not a paired mesh node. Install a node bundle on hardware you
          own to bring it online — no device counts or compute are reported until a real
          node joins.
        </OsCard>
      </section>

      {/* Honest node metrics — every figure muted, never fabricated */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Node overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatPill icon={Boxes} label="Connected devices" value="0 / 2" sub="free tier · none paired" muted />
          <StatPill icon={Cpu} label="Compute available" value="—" sub="no node online" muted />
          <StatPill icon={Activity} label="Mesh status" value="Offline" sub="no peers connected" muted />
          <StatPill icon={ArrowUpFromLine} label="Jobs contributed" value="0" sub="nothing contributed yet" muted />
          <StatPill icon={ArrowDownToLine} label="Jobs received" value="0" sub="nothing received yet" muted />
          <StatPill icon={Gauge} label="Proof-of-capacity" value="—" sub="no capacity proven yet" muted />
          <StatPill icon={Clock} label="Uptime" value="—" sub="no node online" muted />
          <StatPill icon={ShieldCheck} label="Reliability" value="—" sub="no completed jobs" muted />
        </div>
      </section>

      {/* Mesh transport capabilities — honest levels from status.json */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Mesh transport
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <OsCard icon={Share2} title="Hyperswarm DHT + hole-punch" statusLevel="wired" variant="data">
            Nodes find each other and connect directly over a public DHT with hole-punching
            — nothing is exposed to the public internet. Broad multi-device runs are still
            early.
          </OsCard>
          <OsCard icon={Share2} title="Gossip skill-sync" statusLevel="wired" variant="data">
            Skills propagate peer-to-peer across your mesh with verifiable provenance, sealed
            and seal-checked on ingest.
          </OsCard>
          <OsCard icon={Gauge} title="Proof-of-capacity" statusLevel="mock" variant="data">
            Capacity attestation and contribution accounting are scaffolded — measurement
            comes before any attribution, and no capacity is proven until a real node runs.
          </OsCard>
        </div>
        <div className="space-y-2.5">
          <CapStatus name="Hyperswarm DHT + hole-punch" />
          <CapStatus name="Gossip skill-sync" />
          <CapStatus name="Economic / on-chain settlement" />
        </div>
      </section>

      {/* Paired nodes — honest empty surface */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Connected devices
        </h2>
        <EmptyState
          icon={MonitorSmartphone}
          title="No nodes paired"
          description="Bring a device online to join your private mesh. Device counts, compute, jobs, uptime, and reliability appear here only once a real node is paired — the mesh visual is illustrative until then."
          action={
            <Link href="/install" className="btn-outline !px-4 !py-2 text-[12px]">
              Install a node →
            </Link>
          }
        />
      </section>
    </div>
  );
}
