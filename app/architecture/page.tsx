import type { Metadata } from "next";
import {
  Layers, Lock, Database, Network, ShieldCheck, Route, MessageSquare,
  ScanLine, Stamp, BadgeCheck, KeyRound,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import DeepSection from "@/components/pages/DeepSection";
import DeepCard from "@/components/pages/DeepCard";
import StatusLegend from "@/components/pages/StatusLegend";
import SubPageCTA from "@/components/pages/SubPageCTA";
import StatusBadge, { LEVEL_DOT } from "@/components/pages/StatusBadge";
import { Reveal } from "@/components/Reveal";
import { LAYERS, type Level } from "@/lib/status";

export const metadata: Metadata = {
  title: "Architecture — the L0–L5 sovereign stack",
  description:
    "A deep look at the Efficient Labs architecture: six layers from cryptographic substrate to agent surface, the trust trifecta (content-address · capability isolation · post-quantum seal), and how signed skills move safely across the mesh.",
  alternates: { canonical: "/architecture" },
};

// Per-layer iconography + one-line intent — the narrative the raw status data
// doesn't carry. Keyed by the layer id from data/status.json.
const LAYER_META: Record<string, { icon: typeof Layers; tag: string; intent: string }> = {
  L0: { icon: Lock, tag: "Substrate", intent: "The cryptographic floor everything else stands on — secrets sealed, signatures post-quantum." },
  L1: { icon: Database, tag: "Content", intent: "Data named by its hash, with hermetic CI proving freshness — integrity is intrinsic, not bolted on." },
  L2: { icon: Network, tag: "Transport", intent: "The peer-to-peer mesh: DHT discovery, hole-punch links, gossip sync — no central hub." },
  L3: { icon: ShieldCheck, tag: "Capability", intent: "Isolation and approval — children stripped of secrets, writes gated, exec sandboxed." },
  L4: { icon: Route, tag: "Routing", intent: "Where work resolves: local-first inference, BYOK cost gate, fail-closed owner authority." },
  L5: { icon: MessageSquare, tag: "Surface", intent: "How people reach the agent: five channel adapters, with honest stubs marked as stubs." },
};

export default function ArchitecturePage() {
  return (
    <PageShell bleed>
      <SubPageHero
        eyebrow="Architecture"
        crumb="Architecture"
        title={
          <>
            Six layers, from <span className="aurora-text">cryptographic floor</span> to agent surface.
          </>
        }
        lede={
          <>
            Sovereignty isn&apos;t one feature — it&apos;s a stack where each layer is untrusting of the
            one above it. This page walks the architecture top to bottom: the L0–L5 layering from substrate
            to interface, the trust trifecta that holds it together, and how a signed skill travels the
            mesh without anyone having to trust where it came from. Every capability is labelled with its
            real status, pulled live from the same source the status page reads.
          </>
        }
        facts={[
          { k: "Layers", v: "L0 → L5" },
          { k: "Substrate", v: "Post-quantum" },
          { k: "Transport", v: "P2P mesh" },
          { k: "Status", v: "From status.json" },
        ]}
        media={{
          video: "/video/thesis-architecture.mp4",
          poster: "/img/thesis-architecture.png",
          alt: "Software file-architecture rendered as luminous living infrastructure — data flowing through glowing directory modules and brushed-chrome conduits",
        }}
      />

      {/* 01 — the layer model */}
      <DeepSection
        index="01"
        kicker="The layer model"
        title="Substrate → agent → interface"
        lede={
          <>
            Read it bottom-up. L0 establishes cryptographic truth. L1 makes data self-verifying. L2 moves
            it peer-to-peer. L3 contains what runs. L4 decides where it runs. L5 is the surface people
            touch. A break at any layer is caught by the layer below — the lower you go, the less the
            system is willing to assume.
          </>
        }
      >
        <div className="space-y-4">
          {[...LAYERS].reverse().map((layer, i) => {
            const meta = LAYER_META[layer.id];
            const Icon = meta?.icon ?? Layers;
            return (
              <Reveal key={layer.id} delay={i * 0.04}>
                <div className="lm-card overflow-hidden">
                  <div className="grid gap-px md:grid-cols-[260px_minmax(0,1fr)]">
                    {/* layer header rail */}
                    <div className="flex flex-col gap-3 p-6">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/25 bg-[color:var(--color-signal)]/[0.06] text-[color:var(--color-signal)]">
                          <Icon size={17} aria-hidden />
                        </span>
                        <div>
                          <div className="mono text-[11px] uppercase tracking-wider text-[color:var(--color-signal)]">{layer.id} · {meta?.tag}</div>
                          <div className="text-[14px] font-semibold text-[color:var(--color-ink)]">{layer.name}</div>
                        </div>
                      </div>
                      <p className="text-[12.5px] leading-relaxed text-[color:var(--color-ink-faint)]">{meta?.intent}</p>
                    </div>
                    {/* capability rows */}
                    <ul className="divide-y divide-[color:rgba(255,255,255,0.05)] border-t border-[color:rgba(255,255,255,0.05)] md:border-l md:border-t-0">
                      {layer.caps.map((c) => (
                        <li key={c.name} className="flex items-center justify-between gap-4 px-6 py-3.5">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: LEVEL_DOT[c.level as Level] }} />
                            <div className="min-w-0">
                              <p className="text-[13.5px] text-[color:var(--color-ink)]">{c.name}</p>
                              <p className="text-[12px] text-[color:var(--color-ink-faint)]">{c.detail}</p>
                            </div>
                          </div>
                          <StatusBadge level={c.level as Level} />
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="mt-8">
          <StatusLegend />
        </div>
      </DeepSection>

      {/* 02 — trust trifecta */}
      <DeepSection
        index="02"
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

      {/* 03 — signed skills lifecycle */}
      <DeepSection
        index="03"
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
      </DeepSection>

      {/* 04 — the thesis */}
      <DeepSection
        index="04"
        kicker="The thesis"
        title="Automate the architecture, not the wrapper"
        lede={
          <>
            The design principle under all six layers: a correctly-designed file and dataflow architecture
            does the work deterministically, cheaply, and auditably. The agent earns its place only where
            genuine ambiguity lives — not as a wrapper around everything.
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
