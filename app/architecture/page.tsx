import type { Metadata } from "next";
import {
  Layers, Lock, Database, Network, ShieldCheck, Route,
  ScanLine, Stamp, BadgeCheck, KeyRound, Boxes, Terminal, Gauge, Activity, Cpu, Fingerprint, Wallet,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import DeepSection from "@/components/pages/DeepSection";
import DeepCard from "@/components/pages/DeepCard";
import StatusLegend from "@/components/pages/StatusLegend";
import SubPageCTA from "@/components/pages/SubPageCTA";
import StatusBadge from "@/components/pages/StatusBadge";
import { Reveal } from "@/components/Reveal";
import { LAYERS as STACK, PRODUCTS, TONE, type Tone } from "@/lib/architecture-layers";

export const metadata: Metadata = {
  title: "Architecture — the eight layers of the Ownership Layer",
  description:
    "The Efficient Labs architecture: eight foundational layers — Intelligence, Identity, Continuity (ECP), Infrastructure (StratosAgent), Governance, Ownership (Atmosphere), Economic (ARI) and Financial (Commerce) — and the product ecosystem that implements them. Every layer carries its honest maturity.",
  alternates: { canonical: "/architecture" },
};

// Per-layer iconography — keyed by the canonical layer name in lib/architecture-layers.
const ICON: Record<string, typeof Layers> = {
  Intelligence: Cpu,
  Identity: Fingerprint,
  ECP: Database,
  StratosAgent: Terminal,
  "Governance Harness": ShieldCheck,
  Atmosphere: Boxes,
  ARI: Gauge,
  Commerce: Wallet,
};

// Per-product iconography for the ecosystem grid.
const PROD_ICON: Record<string, typeof Layers> = {
  StratosAgent: Terminal,
  ECP: Database,
  "Governance Harness": ShieldCheck,
  Atmosphere: Boxes,
  ARI: Gauge,
  DOP: Activity,
  Commerce: Wallet,
};

export default function ArchitecturePage() {
  return (
    <PageShell bleed>
      <SubPageHero
        eyebrow="Architecture"
        crumb="Architecture"
        title={
          <>
            Eight layers, <span className="aurora-text">one environment you own.</span>
          </>
        }
        lede={
          <>
            Efficient Labs isn&apos;t one feature — it&apos;s the Ownership Layer for autonomous
            intelligence: eight foundational layers, from the models you bring to the money your
            agents may spend, each labelled with what it can actually prove today. The file system
            is the source of truth; everything else is a projection of it.
          </>
        }
        facts={[
          { k: "Layers", v: "Eight" },
          { k: "Source of truth", v: "Your file system" },
          { k: "Proof", v: "Signed receipts" },
          { k: "Status", v: "Honestly labelled" },
        ]}
        media={{
          video: "/video/thesis-architecture.mp4",
          poster: "/img/thesis-architecture.png",
          alt: "Software file-architecture rendered as luminous living infrastructure — data flowing through glowing directory modules and brushed-chrome conduits",
        }}
      />

      {/* 01 — the eight layers */}
      <DeepSection
        index="01"
        kicker="The eight layers"
        title="From the model you bring to the money it may spend"
        lede={
          <>
            Read it as a stack. <strong className="text-[color:var(--color-ink)]">Intelligence</strong> is any
            model you bring; <strong className="text-[color:var(--color-ink)]">Identity</strong> establishes who
            owns and who acts; <strong className="text-[color:var(--color-ink)]">Continuity (ECP)</strong>
            preserves it across time; <strong className="text-[color:var(--color-ink)]">StratosAgent</strong>
            runs it locally; the <strong className="text-[color:var(--color-ink)]">Governance Harness</strong>
            bounds every action; <strong className="text-[color:var(--color-ink)]">Atmosphere</strong> makes it
            yours to own; <strong className="text-[color:var(--color-ink)]">ARI</strong> measures readiness; and{" "}
            <strong className="text-[color:var(--color-ink)]">Commerce</strong> governs spend. Each is labelled
            with the maturity it has actually reached — never rounded up.
          </>
        }
      >
        <div className="space-y-4">
          {STACK.map((l, i) => {
            const Icon = ICON[l.name] ?? Layers;
            const tone = TONE[l.tone].hex;
            return (
              <Reveal key={l.n} delay={i * 0.04}>
                <div className="lm-card p-6 md:p-7">
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
                    <div className="flex items-center gap-4 md:w-64 md:shrink-0">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] border"
                        style={{ borderColor: `color-mix(in oklab, ${tone} 32%, transparent)`, background: `color-mix(in oklab, ${tone} 9%, transparent)`, color: tone }}>
                        <Icon size={18} aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <div className="mono text-[11px] uppercase tracking-wider" style={{ color: tone }}>
                          Layer {l.n} · {l.role}
                        </div>
                        <div className="text-[15px] font-semibold text-[color:var(--color-ink)]">{l.name}</div>
                        <div className="text-[12px] text-[color:var(--color-ink-faint)]">{l.full}</div>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="mono mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] tracking-[0.1em]"
                        style={{ color: tone, background: `color-mix(in oklab, ${tone} 14%, transparent)` }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />
                        {l.status}
                      </span>
                      <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">{l.blurb}</p>
                      <a href={l.cta.href} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80" style={{ color: tone }}>
                        {l.cta.label}<span aria-hidden>→</span>
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* honest maturity legend */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2">
          {(["open", "prod", "enforced", "measured", "roadmap"] as Tone[]).map((t) => (
            <span key={t} className="mono inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.1em] text-[color:var(--color-ink-faint)]">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE[t].hex }} />
              {TONE[t].label}
            </span>
          ))}
          <span className="text-[12px] text-[color:var(--color-ink-faint)]">— honest maturity, never rounded up.</span>
        </div>
      </DeepSection>

      {/* 02 — the product ecosystem */}
      <DeepSection
        index="02"
        kicker="The product ecosystem"
        title="What actually ships against the layers"
        lede={
          <>
            The layers are the frame; these are the products that implement them. Each is owned by you,
            open where it counts, and labelled with its real maturity. DOP — the Digital Organism Protocol —
            is the improvement metabolism that decides what proves out and what gets retired.
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => {
            const Icon = PROD_ICON[p.name] ?? Layers;
            const tone = TONE[p.tone].hex;
            return (
              <Reveal key={p.name} delay={(i % 3) * 0.05}>
                <div className="lm-card flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border"
                      style={{ borderColor: `color-mix(in oklab, ${tone} 30%, transparent)`, background: `color-mix(in oklab, ${tone} 9%, transparent)`, color: tone }}>
                      <Icon size={18} aria-hidden />
                    </span>
                    <span className="mono inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] tracking-[0.1em]"
                      style={{ color: tone, background: `color-mix(in oklab, ${tone} 14%, transparent)` }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tone }} />{p.status}
                    </span>
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-[color:var(--color-ink)]">{p.name}</h3>
                  <p className="mono text-[11px] uppercase tracking-[0.12em]" style={{ color: tone }}>{p.category}</p>
                  <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{p.blurb}</p>
                  <a href={p.href} className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-80" style={{ color: tone }}>
                    Learn more<span aria-hidden>→</span>
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </DeepSection>

      {/* 03 — trust trifecta */}
      <DeepSection
        index="03"
        kicker="The trust trifecta"
        title="Three guarantees that compose"
        lede={
          <>
            The whole architecture rests on three properties working together. Each is useful alone; the
            combination is what lets nodes that don&apos;t know each other cooperate safely. Trust the
            properties, not the participants.
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <DeepCard icon={Database} title="Content-addressed" level="live"
            points={["SHA-256 freshness model", "Data named by its contents", "Tampering changes the name"]}>
            Every block is referenced by the hash of what it contains, so you can fetch it from anyone and
            still prove it&apos;s the bytes you wanted. Integrity is built into the address.
          </DeepCard>
          <DeepCard icon={ShieldCheck} title="Capability-isolated" level="wired"
            points={["Broker env-scoping strips secrets", "WASI sandbox, empty preopens", "Write-approval 402 loop"]}>
            What runs is contained: children inherit no credentials, code executes in a sandbox, and
            consequential writes pass a cost/approval handshake first.
          </DeepCard>
          <DeepCard icon={Stamp} title="Post-quantum sealed" level="live"
            points={["ML-DSA-65 signatures", "On skills and receipts", "Forward-safe provenance"]}>
            Provenance is signed with a post-quantum scheme, so seals and receipts hold up even against a
            future quantum adversary. Origin is proven, not assumed.
          </DeepCard>
        </div>

        <Reveal>
          <div className="data-card mt-5 p-6">
            <p className="mono mb-4 text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
              Why all three, together
            </p>
            <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
              Content-addressing proves <strong className="text-[color:var(--color-ink)]">what</strong> a
              payload is. Post-quantum seals prove <strong className="text-[color:var(--color-ink)]">who</strong>{" "}
              vouched for it. Capability isolation contains <strong className="text-[color:var(--color-ink)]">what
              it can do</strong> once it runs. With all three, a node can accept code and data from a peer
              it has never met — because it never has to trust the peer, only the math.
            </p>
          </div>
        </Reveal>
      </DeepSection>

      {/* 04 — signed skills lifecycle */}
      <DeepSection
        index="04"
        kicker="Signed skills"
        title="How a skill crosses the mesh safely"
        lede="A skill is the unit of capability that moves between nodes. Its lifecycle is built so that no node ever has to trust where a skill came from — only that its seal verifies and its execution is contained."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <DeepCard icon={Stamp} title="1 · Sealed at origin" level="live">
            The author signs the skill with a post-quantum (ML-DSA-65) signature. The seal binds the
            skill&apos;s content hash to its provenance.
          </DeepCard>
          <DeepCard icon={Network} title="2 · Gossiped peer-to-peer" level="wired">
            The skill propagates across the mesh by gossip over direct peer links, carrying its provenance
            with it on every hop.
          </DeepCard>
          <DeepCard icon={ScanLine} title="3 · Verified on ingest" level="wired">
            Before acceptance, verifySkillBlock checks the seal during P2P sync. A skill that fails
            verification is rejected, not quarantined-and-maybe-run.
          </DeepCard>
          <DeepCard icon={Lock} title="4 · Run sandboxed" level="wired">
            Accepted skills execute in the WASI sandbox — empty preopens, no shell, no inherited secrets —
            and emit a sealed receipt of what they did.
          </DeepCard>
        </div>

        <Reveal>
          <div className="data-card mt-5 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/25 bg-[color:var(--color-signal)]/[0.06] text-[color:var(--color-signal)]">
                <BadgeCheck size={17} aria-hidden />
              </span>
              <div>
                <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Self-evolution stays inside the box</p>
                <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
                  Self-authored skills are confined to a narrow integer-transform class — sealed and
                  observed like any other. The agent can extend itself, but never outside that class.
                </p>
              </div>
            </div>
            <StatusBadge level="live" />
          </div>
        </Reveal>

        <div className="mt-8">
          <StatusLegend />
        </div>
      </DeepSection>

      {/* 05 — the thesis */}
      <DeepSection
        index="05"
        kicker="The thesis"
        title="Automate the architecture, not the wrapper"
        lede={
          <>
            The design principle under all eight layers: a correctly-designed file and dataflow
            architecture does the work deterministically, cheaply, and auditably. The agent earns its place
            only where genuine ambiguity lives — not as a wrapper around everything.
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <DeepCard icon={KeyRound} title="Deterministic by default">
            Wherever the work is well-defined, the architecture handles it directly — no model call, no
            non-determinism, no per-token cost. Predictable beats clever.
          </DeepCard>
          <DeepCard icon={Route} title="Inference where it counts">
            The agent is invoked at the points of real ambiguity — and there it routes local-first, paying
            for the frontier only when the work demands it.
          </DeepCard>
          <DeepCard icon={ShieldCheck} title="Auditable end to end">
            Content-addressed inputs, sealed skills, and signed receipts mean every step can be checked
            after the fact. The system shows its work.
          </DeepCard>
        </div>
      </DeepSection>

      <SubPageCTA
        kicker="Go deeper"
        title={<>An architecture you can <span className="aurora-text">verify</span>.</>}
        body="See the mesh that carries it, the agent that runs on top, or the full honest status of every capability."
        primary={{ label: "Read the full status", href: "/status" }}
        secondary={{ label: "Explore the Atmosphere", href: "/atmosphere" }}
      />
    </PageShell>
  );
}
