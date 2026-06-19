import type { Metadata } from "next";
import {
  Cpu, Route, ShieldCheck, Receipt, Boxes, MessageSquare, Lock, Zap,
  Server, GitBranch, ScanLine, KeyRound, BadgeCheck,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import DeepSection from "@/components/pages/DeepSection";
import DeepCard from "@/components/pages/DeepCard";
import RouterFlow from "@/components/pages/RouterFlow";
import StatusLegend from "@/components/pages/StatusLegend";
import StepFlow from "@/components/pages/StepFlow";
import SubPageCTA from "@/components/pages/SubPageCTA";
import StatusBadge from "@/components/pages/StatusBadge";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "StratosAgent — the local-first sovereign agent",
  description:
    "A deep look at StratosAgent: a local-first agent that runs on hardware you own. The local ⇄ your-own-cloud router, signed skills, capability receipts, owner-gating, and the five channels it answers on — with an honest account of what's live.",
  alternates: { canonical: "/stratos" },
};

export default function StratosPage() {
  return (
    <PageShell bleed>
      <SubPageHero
        eyebrow="StratosAgent"
        crumb="StratosAgent"
        title={
          <>
            The agent that runs on <span className="aurora-text">hardware you own</span>.
          </>
        }
        lede={
          <>
            StratosAgent is the agent that lives on your node in the Atmosphere. Local-first by default:
            prompts resolve on your machine, and the frontier cloud is opt-in only — reached through your
            own key, gated by cost, never the silent default. This page is the in-depth version: the
            router, the skills, the receipts, and the guardrails that keep it yours.
          </>
        }
        facts={[
          { k: "Default", v: "Local inference" },
          { k: "Cloud", v: "your own account · opt-in" },
          { k: "Authority", v: "Owner-gated" },
          { k: "Channels", v: "5 adapters" },
        ]}
        media={{
          video: "/video/stratos-wave.mp4",
          poster: "/img/stratos-b.png",
          alt: "StratosAgent rendered as a luminous waveform over hardware, signalling an agent running on metal you own",
        }}
      />

      {/* 01 — what it does */}
      <DeepSection
        index="01"
        kicker="What StratosAgent does"
        title="An agent, not an API key with a chat box"
        lede={
          <>
            StratosAgent takes a request, decides where it should run, pulls in the skills it needs, does
            the work inside a sandbox, and hands back a signed receipt of what it did. Every one of those
            steps is something you can inspect and control — because it all happens on infrastructure you
            hold.
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <DeepCard icon={Route} title="Routes" delay={0}>
            Decides per-request whether work resolves locally or escalates to a frontier model through your
            own key.
          </DeepCard>
          <DeepCard icon={Boxes} title="Runs skills" delay={0.05}>
            Loads signed, content-addressed skills on demand and executes them in an isolated sandbox.
          </DeepCard>
          <DeepCard icon={Receipt} title="Receipts" delay={0.1}>
            Emits a sealed capability receipt for actions it takes, so the trail is auditable after the
            fact.
          </DeepCard>
          <DeepCard icon={MessageSquare} title="Answers everywhere" delay={0.15}>
            Reachable on Telegram, Discord, Slack, Matrix, and Signal — the same agent, many front doors.
          </DeepCard>
        </div>
      </DeepSection>

      {/* 02 — the router */}
      <DeepSection
        index="02"
        kicker="The router · local ⇄ your own cloud"
        title={<>Local first. Cloud <span className="aurora-text">only when it earns it</span>.</>}
        lede={
          <>
            The router is the heart of the agent&apos;s sovereignty. The default destination is your own
            machine. The frontier cloud is reached only through a key you supply, only when the work
            genuinely needs it, and only after passing a cost gate — so spend is a decision, never a
            surprise.
          </>
        }
      >
        {/* signature: local-first routing — default local, cloud opt-in */}
        <RouterFlow />
        <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1fr] lg:items-start">
          <StepFlow
            steps={[
              { title: "Request arrives", body: "A prompt comes in from any of the five channels and is attributed to its sender." },
              { title: "Classify the work", body: <>Coding and routine tasks route <strong className="text-[color:var(--color-ink)]">local</strong>; genuinely complex reasoning is a candidate for the frontier.</> },
              { title: "Cost gate (your own AI accounts)", body: "If escalation is warranted, the cost gate on /v1/chat/completions checks the spend handshake before any paid call leaves the node." },
              { title: "Resolve & receipt", body: "Work runs at the chosen tier and returns with a sealed receipt of what happened." },
            ]}
          />
          <div className="space-y-5">
            <DeepCard icon={Cpu} title="Local ⇄ cloud language routing" level="live"
              points={["Coding → local", "Complex → proxy", "The destination is chosen per request"]}>
              The router classifies each request and sends it to the cheapest tier that can actually do the
              job. Most work never leaves your machine.
            </DeepCard>
            <DeepCard icon={KeyRound} title="Cost gate (your own AI accounts)" level="live"
              points={["Lives on /v1/chat/completions — the only spend route", "Your key, your bill, your ceiling", "No paid call without passing the gate"]}>
              Frontier AI requests run through your own account — your key, your bill. The single spend route is gated, so the cloud is
              opt-in by construction rather than the silent default.
            </DeepCard>
          </div>
        </div>
      </DeepSection>

      {/* 03 — skills */}
      <DeepSection
        index="03"
        kicker="Skills"
        title="Signed, content-addressed capabilities"
        lede={
          <>
            A skill is a unit of capability the agent can load on demand. Skills are addressed by content
            hash and sealed with post-quantum signatures, so the agent will only run code whose provenance
            it can verify — and it runs it inside an isolated sandbox, stripped of your secrets.
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <DeepCard icon={ScanLine} title="Seal-verified on ingest" level="wired"
            points={["verifySkillBlock runs in P2P sync", "Provenance checked before acceptance", "Unsigned or tampered skills rejected"]}>
            Before a skill is accepted off the mesh, its seal is verified. A skill that fails verification
            never makes it into the runtime.
          </DeepCard>
          <DeepCard icon={Lock} title="Sandboxed execution" level="wired"
            points={["Exec + WASI sandbox", "Empty preopens, no shell exec", "Sanitized inputs only"]}>
            Skills execute in a WASI sandbox with empty preopens and no shell access — capability is
            granted explicitly, never inherited.
          </DeepCard>
          <DeepCard icon={ShieldCheck} title="Secret-guarded I/O" level="live"
            points={["Outbound text scrubbed of secret-shaped strings", "Child + sidecars stripped of creds", "No NODE_OPTIONS or proxy creds leak through"]}>
            Every adapter scrubs outbound text of anything that looks like a secret, and broker-scoped
            children run without your credentials in their environment.
          </DeepCard>
        </div>
      </DeepSection>

      {/* 04 — capability receipts */}
      <DeepSection
        index="04"
        kicker="Capability receipts"
        title="Every action leaves a sealed trail"
        lede={
          <>
            When the agent does something consequential, it produces a capability receipt: a post-quantum
            signed record of what was done. Combined with the write-approval handshake, this means
            consequential actions are both <em>authorised before</em> they happen and <em>auditable
            after</em>.
          </>
        }
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <DeepCard icon={Receipt} title="Sealed receipts" level="live"
            points={["ML-DSA-65 signatures on receipts", "Tamper-evident record of actions", "Verifiable against the post-quantum seal"]}>
            A receipt is signed with the same post-quantum scheme as skills, so the record of what the
            agent did can be verified later and can&apos;t be quietly rewritten.
          </DeepCard>
          <DeepCard icon={BadgeCheck} title="Write-approval (402 loop)" level="wired"
            points={["Cost handshake wired into all five channels", "Consequential writes ask before acting", "Approval precedes the receipt"]}>
            Before a write or a spend, the agent runs a cost/approval handshake across every channel. The
            action only proceeds once it&apos;s approved — and then it&apos;s receipted.
          </DeepCard>
        </div>

        <Reveal>
          <div className="data-card mt-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="mono text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
                Owner-gating — fail-closed by default
              </p>
              <StatusBadge level="live" />
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
              Authority is fail-closed: <strong className="text-[color:var(--color-ink)]">if no owner is
              set, the agent has no command authority.</strong> It will not act on instructions from an
              unestablished owner. Combined with sealed receipts and the write-approval loop, this means
              StratosAgent can be reached by many people across five channels while only ever taking
              consequential action for the operator who actually owns the node.
            </p>
          </div>
        </Reveal>
      </DeepSection>

      {/* 05 — channels & evolution */}
      <DeepSection
        index="05"
        kicker="Reach & evolution"
        title="Many front doors, one sovereign agent"
        lede="StratosAgent meets people where they already are, and it can extend its own narrow set of skills under strict, sealed observation. Here's what's live, what needs configuration, and what's honestly still a placeholder."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <DeepCard icon={MessageSquare} title="Channel adapters" level="config">
            Telegram, Discord, Slack, Matrix, and Signal adapters exist, but external tokens and real
            send/receive verification are still required before they count as live.
          </DeepCard>
          <DeepCard icon={Zap} title="Self-evolution (narrow)" level="live">
            A tightly-scoped class of integer-transform skills can be self-authored — sealed, observed, and
            never beyond that class.
          </DeepCard>
          <DeepCard icon={Server} title="Speech & vision" level="mock">
            STT/TTS adapters currently return placeholders. They are scaffolded, not real — and labelled
            that way.
          </DeepCard>
          <DeepCard icon={GitBranch} title="Agent-to-agent (ACP)" level="mock">
            The agent-to-agent proxy returns scaffolded responses today. It is a stub on the honest
            roadmap, not a shipping feature.
          </DeepCard>
        </div>

        <div className="mt-8">
          <StatusLegend />
        </div>
      </DeepSection>

      <SubPageCTA
        kicker="Bring it online"
        title={<>Put StratosAgent on <span className="aurora-text">your metal</span>.</>}
        body="Two commands and the agent is live on hardware you own — local-first, owner-gated, reachable across five channels. Read the layered architecture or install now."
        primary={{ label: "Install StratosAgent", href: "/install" }}
        secondary={{ label: "See the architecture", href: "/architecture" }}
      />
    </PageShell>
  );
}
