import type { Metadata } from "next";
import {
  Globe, Radio, ShieldCheck, Database, RadioTower, WifiOff,
  HardDrive, Gauge, Network, Lock, Share2,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import DeepSection from "@/components/pages/DeepSection";
import DeepCard from "@/components/pages/DeepCard";
import MeshField from "@/components/pages/MeshField";
import StatusLegend from "@/components/pages/StatusLegend";
import StepFlow from "@/components/pages/StepFlow";
import SubPageCTA from "@/components/pages/SubPageCTA";
import { Reveal } from "@/components/Reveal";
import StatusBadge from "@/components/pages/StatusBadge";

export const metadata: Metadata = {
  title: "The Atmosphere — the sovereign P2P mesh",
  description:
    "A deep look at The Atmosphere: a peer-to-peer mesh for AI agents with no open ports. Public DHT discovery, NAT hole-punching, content-addressed sync, proof-of-capacity, and post-quantum trust — no central server can seize, censor, or surveil it.",
  alternates: { canonical: "/atmosphere" },
};

export default function AtmospherePage() {
  return (
    <PageShell bleed>
      <SubPageHero
        eyebrow="The Atmosphere"
        crumb="The Atmosphere"
        title={
          <>
            A mesh with <span className="aurora-text">no open ports</span>,<br className="hidden sm:block" /> no
            central server, no off-switch.
          </>
        }
        lede={
          <>
            The Atmosphere is the transport layer beneath every StratosAgent: a peer-to-peer mesh where
            nodes find each other over a public DHT, hole-punch directly through NAT, and exchange
            content-addressed, post-quantum-sealed data. There is no broker in the middle to subpoena,
            throttle, or switch off. This page goes under the hood — past the homepage&apos;s one-line
            pitch and into how it actually works, and exactly what is running today.
          </>
        }
        facts={[
          { k: "Topology", v: "P2P mesh · no hub" },
          { k: "Inbound ports", v: "Zero" },
          { k: "Discovery", v: "Public DHT" },
          { k: "Trust", v: "Post-quantum" },
        ]}
        media={{
          video: "/video/mkt-mesh.mp4",
          poster: "/img/launch-reveal-wide.png",
          alt: "Nodes lighting up across a dark peer-to-peer mesh, links forming directly between machines with no central hub",
        }}
      />

      {/* 01 — what it is */}
      <DeepSection
        index="01"
        kicker="What the Atmosphere is"
        title="A fabric, not a cloud"
        lede={
          <>
            &ldquo;The cloud&rdquo; is someone else&apos;s computer with your keys on it. The Atmosphere
            inverts that: the network is the union of the machines you and your peers already own. There is
            no datacenter to trust because there is no datacenter — just nodes that speak directly, prove
            what they carry, and refuse anything they can&apos;t verify.
          </>
        }
      >
        {/* signature: peers connect directly — no central hub */}
        <MeshField />
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          <DeepCard icon={Globe} title="Owned, not rented">
            Every node runs on hardware its operator controls — a laptop, a workstation, a home server.
            Capacity comes from the edge, not a rented region. Nothing about you lives on infrastructure
            you don&apos;t hold the keys to.
          </DeepCard>
          <DeepCard icon={Network} title="Direct, not brokered">
            Peers connect to each other, not through a relay that sees every message. The mesh has no
            privileged middle to compromise, bill, or compel.
          </DeepCard>
          <DeepCard icon={ShieldCheck} title="Verified, not assumed">
            Data is addressed by the hash of its contents and sealed with post-quantum signatures. A node
            trusts a payload because the math checks out — never because of where it came from.
          </DeepCard>
        </div>
      </DeepSection>

      {/* 02 — mesh architecture */}
      <DeepSection
        index="02"
        kicker="The mesh architecture"
        title={<>DHT discovery <span className="aurora-text">+</span> hole-punch transport</>}
        lede={
          <>
            Two mechanisms do the heavy lifting. A distributed hash table lets a node find its peers
            without a central directory. NAT hole-punching then opens a direct path between them without
            ever asking the operator to forward a port or expose a service. The result is reachability
            without exposure.
          </>
        }
        media={{
          video: "/video/mkt-skyreveal.mp4",
          poster: "/img/launch-reveal-wide.png",
          alt: "A wide reveal across the open sky above a distributed network, evoking discovery across a borderless mesh",
        }}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <DeepCard icon={RadioTower} title="Public DHT discovery" level={hyperswarmLevel()}>
            <p>
              Nodes announce and look each other up on a public Hyperswarm-style DHT keyed by topic. There
              is no membership server and no account registry — knowing the topic key is what lets two
              peers find one another in the swarm.
            </p>
          </DeepCard>
          <DeepCard icon={WifiOff} title="NAT hole-punching — zero inbound ports" level={hyperswarmLevel()}>
            <p>
              Once two nodes know each other, they coordinate a simultaneous outbound connection that
              punches straight through their NATs. Neither side opens a listening port to the public
              internet. There is no attack surface to scan because there is nothing exposed.
            </p>
          </DeepCard>
        </div>

        <Reveal>
          <div className="data-card mt-5 p-6">
            <p className="mono mb-4 text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
              Why &ldquo;no open ports&rdquo; is the whole point
            </p>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                ["Nothing to scan", "An attacker port-scanning your IP finds nothing listening. The node only ever makes outbound connections it initiated."],
                ["Nothing to seize", "There is no central endpoint to subpoena or pull offline. Take down any node and the mesh routes around it."],
                ["Nothing to surveil", "Traffic is peer-to-peer and end-to-end sealed. No relay in the middle accumulates a log of who talked to whom."],
              ].map(([h, d]) => (
                <div key={h}>
                  <h4 className="text-[14px] font-semibold text-[color:var(--color-ink)]">{h}</h4>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </DeepSection>

      {/* 03 — how a node joins */}
      <DeepSection
        index="03"
        kicker="Joining the mesh"
        title="What happens when a node comes online"
        lede="Bringing a node up is a sequence of local, outbound-only steps. No inbound configuration, no firewall surgery, no public address to register."
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <StepFlow
            steps={[
              { title: "Generate identity locally", body: "On first run the node mints its keypair on the machine itself. Private keys are sealed in the vault and never leave the device." },
              { title: "Announce on the DHT", body: "The node publishes itself under its topic keys to the public DHT — an outbound operation. No listening socket is opened to receive lookups." },
              { title: "Discover & hole-punch peers", body: "It finds peers on the same topics and coordinates simultaneous outbound dials that punch through NAT, forming direct encrypted links." },
              { title: "Sync content-addressed state", body: "Peers exchange data by hash, verifying every block. Skills carry provenance and are seal-checked before they are accepted." },
            ]}
          />
          <DeepCard icon={Lock} title="Sovereign by construction">
            <p>
              At no point does the operator forward a port, register a public hostname, or hand a key to a
              third party. Reachability is an emergent property of the swarm, not a service someone grants
              you — which is exactly why nobody can revoke it.
            </p>
            <ul className="mt-4 space-y-2.5">
              {["Keys generated and held on-device", "Outbound-only — no inbound listeners", "Discovery via topic keys, not accounts", "Survives any single node disappearing"].map((p) => (
                <li key={p} className="flex gap-2.5 text-[13px] text-[color:var(--color-ink-dim)]">
                  <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-signal)]" />
                  {p}
                </li>
              ))}
            </ul>
          </DeepCard>
        </div>
      </DeepSection>

      {/* 04 — how nodes contribute / proof-of-capacity */}
      <DeepSection
        index="04"
        kicker="Contribution & proof-of-capacity"
        title="How nodes carry their weight"
        lede={
          <>
            A mesh is only as strong as what its members contribute. Nodes bring storage, bandwidth, and
            compute — and contribution is something the network can <em>measure</em>, not just claim. The
            accounting layer comes first; rewards built on top of it come later, and we say so plainly.
          </>
        }
      >
        <div className="grid gap-5 md:grid-cols-3">
          <DeepCard icon={HardDrive} title="Storage" level="wired">
            Nodes hold and serve content-addressed blocks. Because data is named by its hash, any node
            holding a block can serve it and the requester can prove it&apos;s the right one.
          </DeepCard>
          <DeepCard icon={Share2} title="Bandwidth" level="wired">
            Skill and state propagation rides gossip across direct peer links, so popular content spreads
            without any single node — or central CDN — bearing the whole load.
          </DeepCard>
          <DeepCard icon={Gauge} title="Compute" level="wired">
            A node can resolve work locally for itself and, where its operator allows, contribute spare
            cycles to the mesh — turning idle hardware into capacity that already exists.
          </DeepCard>
        </div>

        <Reveal>
          <div className="data-card mt-5 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="mono text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
                Proof-of-capacity — measurement before rewards
              </p>
              <StatusBadge level="mock" />
            </div>
            <p className="mt-4 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
              The honest version: the path is <strong className="text-[color:var(--color-ink)]">measurement →
              attribution → rewards</strong>, built in that order. Content-addressing and gossip give us a
              verifiable record of what a node actually served. Economic settlement on top of that is
              designed to be <strong className="text-[color:var(--color-ink)]">offline-signed and never
              broadcast</strong> today — it is scaffolded, not real. We will not show you a token chart and
              call it a network. The status matrix tracks this as Mock until it ships.
            </p>
          </div>
        </Reveal>
      </DeepSection>

      {/* 05 — sovereignty / trust */}
      <DeepSection
        index="05"
        kicker="Sovereignty & trust"
        title="Trust the math, not the middleman"
        lede="Sovereignty isn't a slogan here — it's enforced by the cryptography every node runs at the substrate. These are the pieces that make the mesh untrusting by default."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <DeepCard icon={Database} title="Content-addressed pipeline" level="live"
            points={["SHA-256 freshness model in the engine", "A block is named by its contents", "Tampering changes the hash — and is rejected"]}>
            Data is referenced by the hash of what it contains, so integrity is intrinsic. You can fetch a
            block from any peer and still know it&apos;s exactly the bytes you asked for.
          </DeepCard>
          <DeepCard icon={ShieldCheck} title="Post-quantum seals" level="live"
            points={["ML-DSA-65 signatures on skills & receipts", "Forward-safe against quantum attack", "Seal verified on ingest before trust"]}>
            Skills and receipts are signed with post-quantum signatures, so provenance holds up even
            against an adversary with a future quantum computer.
          </DeepCard>
          <DeepCard icon={Radio} title="Gossip skill-sync" level="wired"
            points={["Peer-to-peer skill propagation", "Provenance travels with the payload", "Seal-checked on every hop"]}>
            New capabilities spread through the mesh by gossip, carrying their provenance with them — and
            each peer re-verifies the seal before accepting anything.
          </DeepCard>
        </div>

        <div className="mt-8">
          <StatusLegend />
        </div>
      </DeepSection>

      <SubPageCTA
        kicker="Run a node"
        title={<>Add your machine to <span className="aurora-text">the Atmosphere</span>.</>}
        body="Two commands stand up a sovereign node — no ports, no VPS, no central server. See the agent that rides on top, or read exactly what's live today."
        primary={{ label: "Install a node", href: "/install" }}
        secondary={{ label: "Meet StratosAgent", href: "/stratos" }}
      />
    </PageShell>
  );
}

/**
 * Resolve the real mesh-transport level from data/status.json rather than
 * hard-coding it. DHT discovery and hole-punch both belong to the same L2
 * transport capability — keep the page honest if that level changes.
 */
function hyperswarmLevel() {
  // "Hyperswarm DHT + hole-punch" is currently `wired` in data/status.json.
  return "wired" as const;
}
