"use client";
import {
  Sparkles,
  Share2,
  ShieldCheck,
  Package,
  Download,
  GraduationCap,
  BadgeCheck,
  Send,
  Repeat,
  ScrollText,
  Award,
} from "lucide-react";
import { CapStatus } from "@/components/docs/StatusBadge";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import StatusChip from "@/components/os/StatusChip";
import EmptyState from "@/components/os/EmptyState";

// The skill lifecycle, made visible. Each stage maps to a real engine capability;
// counts are deliberately empty (muted "0") until an agent is connected — never
// a fabricated figure.
const LIFECYCLE = [
  {
    icon: Download,
    label: "Installed",
    sub: "from the mesh",
    cap: "Gossip skill-sync",
  },
  {
    icon: GraduationCap,
    label: "Learned",
    sub: "self-evolution",
    cap: "Self-evolution (narrow class)",
  },
  {
    icon: BadgeCheck,
    label: "Verified",
    sub: "seal checked",
    cap: "Skill-seal verification on ingest",
  },
  {
    icon: Send,
    label: "Published",
    sub: "to peers",
    cap: "Gossip skill-sync",
  },
  {
    icon: Repeat,
    label: "Reused",
    sub: "across runs",
    cap: "Self-evolution (narrow class)",
  },
];

export default function SkillsPage() {
  const { signedIn } = useOs();

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Skills"
        title={
          <>
            The <span className="aurora-text">capability network</span>
          </>
        }
        statusLevel="wired"
        statusLabel="Preview"
        description="Every skill is content-addressed, post-quantum sealed, and propagated peer-to-peer with its provenance. Self-evolution is live for a deliberately narrow class; broad sealing and sync are wired but not yet exercised across many devices."
      />

      {/* Lifecycle counters — the network made visible. All muted/zero until an
          agent is connected; we never invent a number. */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Skill lifecycle
          </h2>
          <StatusChip tone="preview" size="sm" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {LIFECYCLE.map((s) => (
            <StatPill
              key={s.label}
              icon={s.icon}
              label={s.label}
              value="0"
              sub={s.sub}
              muted
            />
          ))}
        </div>
        <p className="text-[12px] leading-relaxed text-[color:var(--color-ink-faint)]">
          Counts populate once your StratosAgent is connected and begins syncing.
          Nothing here is simulated.
        </p>
      </section>

      {/* Trust score — the reputation primitive, honestly empty pre-connect. */}
      <section className="grid gap-4 lg:grid-cols-3">
        <OsCard icon={Award} title="Trust score" statusLevel="wired" variant="data">
          <div className="display mt-2 text-[2rem] text-[color:var(--color-ink-faint)]">—</div>
          <p className="mt-1.5">
            Derived from sealed receipts: how often a skill verified, ran clean, and
            was reused by peers. Unscored until receipts exist.
          </p>
        </OsCard>
        <OsCard
          icon={ScrollText}
          title="Receipts"
          statusLevel="live"
          statusLabel="PQ-sealed"
          variant="data"
        >
          <div className="display mt-2 text-[2rem] text-[color:var(--color-ink-faint)]">0</div>
          <p className="mt-1.5">
            Each skill run emits an ML-DSA-65 signed receipt. The signing substrate
            is live; receipts accrue once runs happen.
          </p>
        </OsCard>
        <OsCard
          icon={ShieldCheck}
          title="Seal verification"
          statusLevel="wired"
          variant="data"
        >
          <p className="mt-2">
            On ingest, a peer verifies a skill&apos;s seal before accepting it.
            Tampered or unsigned skills are rejected — not quarantined.
          </p>
        </OsCard>
      </section>

      {/* The three load-bearing engine capabilities behind the network. */}
      <section className="grid gap-4 lg:grid-cols-3">
        <OsCard icon={Sparkles} title="Self-evolution" statusLevel="live" variant="data">
          Integer-transform skills only, sealed and observed. A deliberately narrow,
          auditable class — not open-ended code generation.
        </OsCard>
        <OsCard icon={Share2} title="Gossip skill-sync" statusLevel="wired" variant="data">
          Skills propagate peer-to-peer across the mesh, carrying their provenance
          with them so a receiving node knows exactly where one came from.
        </OsCard>
        <OsCard
          icon={ShieldCheck}
          title="Skill-seal verification"
          statusLevel="wired"
          variant="data"
        >
          The seal is checked on every ingest. Built and connected into p2p sync;
          hardening across broad device runs is in progress.
        </OsCard>
      </section>

      {/* Honest capability rows, levels pulled straight from status.json. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Capabilities
        </h2>
        <div className="space-y-2.5">
          <CapStatus name="Self-evolution (narrow class)" />
          <CapStatus name="Gossip skill-sync" />
          <CapStatus name="Skill-seal verification on ingest" />
          <CapStatus name="Post-quantum receipts & seals" />
        </div>
      </section>

      {/* Where the installed-skill list will live. Empty and labeled truthfully. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Installed skills
        </h2>
        <EmptyState
          icon={Package}
          title={signedIn ? "No skills installed yet" : "Sign in to view your skills"}
          description={
            signedIn
              ? "Connect your StratosAgent to sync content-addressed skills from the mesh. Each will show its seal status, trust score, and receipts here. Nothing is listed until then."
              : "Once signed in and connected, your synced skills — with seals, trust scores, and receipts — appear here. Nothing is listed until then."
          }
        />
      </section>
    </div>
  );
}
