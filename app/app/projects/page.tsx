"use client";
import {
  FolderKanban,
  Globe,
  Inbox,
  GitBranch,
  LifeBuoy,
  Files,
  Cpu,
  Workflow,
  Sparkles,
  Brain,
} from "lucide-react";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatPill from "@/components/os/StatPill";
import StatusChip from "@/components/os/StatusChip";
import EmptyState from "@/components/os/EmptyState";
import ComingSoon from "@/components/os/ComingSoon";

/**
 * Projects — workspaces for developers and businesses. A project is a named effort
 * ("build the website", "monitor the inbox", "deploy the repo", "run the support
 * queue") that bundles the files, agents, workflows, skills, and memory it needs.
 *
 * Honest by construction: nothing is wired yet. The module renders example project
 * SHAPES (clearly marked Preview, locked when signed out) and an honest empty state —
 * no project, file count, or activity figure is ever fabricated.
 */
const EXAMPLES = [
  {
    icon: Globe,
    title: "Build a website",
    body: "Scaffold, copy, and iterate on a site — the agent owns the repo, the assets, and the deploy.",
  },
  {
    icon: Inbox,
    title: "Monitor an inbox",
    body: "Triage, draft, and route incoming mail against rules you set, with every send gated by approval.",
  },
  {
    icon: GitBranch,
    title: "Deploy a repo",
    body: "Watch a repository, run checks, and ship — each deploy carrying a signed receipt.",
  },
  {
    icon: LifeBuoy,
    title: "Run a support queue",
    body: "Pick up tickets, draft replies from your skills + memory, and escalate what needs a human.",
  },
];

const HOLDS = [
  { icon: Files, label: "Files" },
  { icon: Cpu, label: "Agents" },
  { icon: Workflow, label: "Workflows" },
  { icon: Sparkles, label: "Skills" },
  { icon: Brain, label: "Memory" },
];

export default function ProjectsPage() {
  const { signedIn } = useOs();
  const locked = !signedIn;

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Projects"
        title="Workspaces"
        description="A project is one focused effort — build a site, watch an inbox, deploy a repo, run a support queue — bundling the files, agents, workflows, skills, and memory it needs. This module isn't wired yet; everything below is an example shape, not live data."
        actions={<StatusChip tone="preview" label="Preview" />}
      />

      {/* Honest muted zeros — never a fabricated count. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Your workspaces</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatPill icon={FolderKanban} label="Projects" value="0" sub="none yet" muted />
          <StatPill icon={Cpu} label="Agents assigned" value="0" sub="none yet" muted />
          <StatPill icon={Workflow} label="Workflows" value="0" sub="none yet" muted />
          <StatPill icon={Files} label="Files" value="0" sub="none yet" muted />
        </div>
      </section>

      {/* Example project shapes — clearly Preview, locked when signed out. */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            What a project can be
          </h2>
          <StatusChip tone="preview" label="Examples" size="sm" />
        </div>
        <p className="max-w-2xl text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
          Illustrative shapes, not live workspaces. None of these are connected.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {EXAMPLES.map((ex) => (
            <OsCard key={ex.title} icon={ex.icon} title={ex.title} variant="lm" locked={locked}>
              {ex.body}
            </OsCard>
          ))}
        </div>
      </section>

      {/* What each project bundles. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Everything a project holds
        </h2>
        <div className="data-card flex flex-wrap gap-2.5 p-5">
          {HOLDS.map((h) => (
            <span
              key={h.label}
              className="mono inline-flex items-center gap-2 rounded-[var(--radius-pill)] border border-[color:var(--color-line)] px-3 py-1.5 text-[12px] text-[color:var(--color-ink-dim)]"
            >
              <h.icon size={14} className="text-[color:var(--color-signal)]" />
              {h.label}
            </span>
          ))}
        </div>
      </section>

      {/* Honest empty surface — no fabricated rows. */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Active projects</h2>
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="When this module ships you'll create a workspace, assign agents and skills to it, and switch context between efforts. Nothing is wired yet — no projects are shown until they're real."
        />
      </section>

      <ComingSoon
        title="Projects & workspaces"
        description="Create a named workspace, give it files, agents, workflows, skills, and memory, and switch context between efforts. In design — no data until it ships."
      />
    </div>
  );
}
