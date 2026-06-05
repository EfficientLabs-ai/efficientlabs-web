"use client";
import Link from "next/link";
import {
  Lock,
  ShieldCheck,
  Database,
  Search,
  Brain,
  FileText,
  Boxes,
} from "lucide-react";
import { CapStatus } from "@/components/docs/StatusBadge";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import StatusChip from "@/components/os/StatusChip";
import EmptyState from "@/components/os/EmptyState";
import ComingSoon from "@/components/os/ComingSoon";

/**
 * Memory — the user-owned second brain (knowledge + full-text search).
 *
 * Honesty: memory is sealed at rest (Vault, AES-GCM — live) and lives on the
 * user's own machine. The browsable / searchable knowledge surface itself is
 * not a shipped capability, so it renders as Preview / Coming-soon / empty —
 * never fabricated entries, counts, or search results.
 */
export default function MemoryPage() {
  const { signedIn } = useOs();

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Memory"
        title={
          <>
            Your <span className="aurora-text">second brain</span>
          </>
        }
        statusLevel="live"
        description="A knowledge base you own. Memory is sealed at rest with AES-GCM and the derived keys are zeroed after use — it lives on your hardware, decrypted locally, never on a server. Browsing and full-text search are coming; no fake entries are shown."
        actions={<StatusChip level="live" label="User-owned · sealed" />}
      />

      {/* Honest snapshot — zero/empty, never fabricated counts */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatPill icon={FileText} label="Memory items" value="—" sub="preview" muted />
        <StatPill icon={Boxes} label="Collections" value="0" sub="none yet" muted />
        <StatPill icon={Lock} label="At-rest encryption" value="AES-GCM" sub="keys zeroed" />
        <StatPill
          icon={Database}
          label="Storage"
          value="Local"
          sub="on hardware you own"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OsCard icon={Lock} title="Vault (AES-GCM)" statusLevel="live" variant="data">
          Your memory is sealed at rest with AES-GCM; derived keys are wiped from memory
          after use. You hold the keys — not us.
        </OsCard>
        <OsCard icon={ShieldCheck} title="Secret-guard" statusLevel="live" variant="data">
          Outbound text is scrubbed of secret-shaped strings on every adapter before it
          ever leaves your machine.
        </OsCard>
      </div>

      {/* Knowledge search — clearly a preview, never returns fake results */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Search your knowledge
          </h2>
          <StatusChip tone="coming" label="Full-text search soon" />
        </div>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
          Ask your second brain in plain language. Full-text search over your sealed
          memory runs locally on your machine — it is not wired into this surface yet, so
          this field is inert and returns nothing.
        </p>

        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 px-3.5 py-3 opacity-60">
          <Search size={16} className="shrink-0 text-[color:var(--color-ink-faint)]" />
          <input
            disabled
            aria-label="Search your knowledge (full-text search coming soon)"
            placeholder="Search your second brain…"
            className="mono min-w-0 flex-1 bg-transparent text-[13px] text-[color:var(--color-ink-dim)] placeholder:text-[color:var(--color-ink-faint)] focus:outline-none"
          />
          <span className="mono shrink-0 text-[11px] text-[color:var(--color-ink-faint)]">
            soon
          </span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Capabilities</h2>
        <div className="space-y-2.5">
          <CapStatus name="Vault (AES-GCM, memory-wiped)" />
          <CapStatus name="Secret-guard on every adapter" />
          <CapStatus name="Content-addressed pipeline" />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Memory browser</h2>
        <EmptyState
          icon={Brain}
          title={signedIn ? "Nothing to show yet" : "Sign in to view your memory"}
          description={
            signedIn
              ? "A browsable view of your agent's sealed memory is coming. It will decrypt on your machine — never on a server. Until then, no entries are listed."
              : "Your second brain is private to you. Sign in to connect the machine that holds your sealed memory; nothing is listed here until then."
          }
          action={
            signedIn ? undefined : (
              <Link href="/login" className="btn-outline !px-4 !py-2 text-[12px]">
                <Lock size={14} /> Sign in
              </Link>
            )
          }
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <ComingSoon
            title="Browse sealed memory"
            description="Inspect, organize, and prune your agent's memory — decrypted locally, never on a server."
          />
          <ComingSoon
            title="Full-text knowledge search"
            description="Query everything your agent has learned in plain language, with results ranked locally over your own index."
          />
        </div>
      </section>
    </div>
  );
}
