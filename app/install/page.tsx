import type { Metadata } from "next";
import {
  Network, KeyRound,
  HardDrive, Cpu, WifiOff, Server, MessageSquare, Lock,
} from "lucide-react";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import DeepSection from "@/components/pages/DeepSection";
import DeepCard from "@/components/pages/DeepCard";
import StepFlow from "@/components/pages/StepFlow";
import StatusLegend from "@/components/pages/StatusLegend";
import SubPageCTA from "@/components/pages/SubPageCTA";
import InstallTerminal from "@/components/pages/InstallTerminal";
import StatusBadge from "@/components/pages/StatusBadge";
import CopyButton from "@/components/CopyButton";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Install — run a sovereign node on your own metal",
  description:
    "Install The Atmosphere runtime and bring StratosAgent online in two commands. Per-OS quickstart, exactly what the installer does, requirements, and what's live today — no open ports, post-quantum keys sealed, meshed peer-to-peer.",
  alternates: { canonical: "/install" },
};

export default function InstallPage() {
  return (
    <PageShell bleed>
      <SubPageHero
        eyebrow="Install"
        crumb="Install"
        title={
          <>
            Two commands. A sovereign node on <span className="aurora-text">hardware you own</span>.
          </>
        }
        lede={
          <>
            No cloud account, no VPS, no ports to forward. The installer stands up the Atmosphere runtime
            and brings StratosAgent online on the machine in front of you — keys generated locally, meshed
            peer-to-peer, nothing exposed to the public internet. This is the in-depth install: the exact
            commands per OS, what each step actually does, what you need, and what&apos;s live today.
          </>
        }
        facts={[
          { k: "Commands", v: "Two" },
          { k: "Inbound ports", v: "Zero" },
          { k: "Keys", v: "Local · sealed" },
          { k: "Account", v: "None required" },
        ]}
        media={{
          video: "/video/mkt-datacenter.mp4",
          poster: "/img/ops-backdrop.jpg",
          alt: "A calm, slow pan through racks of owned hardware coming online — the metal a sovereign node runs on",
        }}
      />

      {/* 01 — quickstart terminal */}
      <DeepSection
        index="01"
        kicker="Quickstart"
        title={<>Lives in your <span className="aurora-text">terminal</span></>}
        lede="Pick your OS, copy the two commands, and you have a sovereign node. The same flow on macOS, Linux, and Windows — only the shell syntax differs."
      >
        <div className="grid gap-10 [&>*]:min-w-0 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <InstallTerminal />

          <Reveal delay={0.1}>
            <ol className="space-y-4">
              {[
                ["One installer", "A single command brings up the Atmosphere runtime — no firewall holes, no inbound ports, nothing to expose to the internet."],
                ["Your hardware", "StratosAgent provisions on the machine you already own. Keys are generated locally and never leave it."],
                ["Meshed instantly", "Your node hole-punches into the global mesh and is reachable across every channel — still fully sovereign."],
              ].map(([h, d], i) => (
                <li key={h} className="data-card flex gap-4 p-5">
                  <span className="mono grid h-7 w-7 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.06] text-[12px] text-[color:var(--color-signal)]">{i + 1}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">{h}</h3>
                    <p className="mt-1 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </DeepSection>

      {/* 02 — what happens */}
      <DeepSection
        index="02"
        kicker="What actually happens"
        title="Each step, demystified"
        lede="The two commands hide a precise sequence. Nothing here phones home for permission, opens a listener, or hands a key to a third party — every step is local or outbound-only."
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-start">
          <StepFlow
            steps={[
              { title: "Fetch & verify the runtime", body: "The installer downloads the Atmosphere runtime and verifies it before anything runs. No background service is exposed to the network." },
              { title: "Mint local keys", body: <>The public operating core generates a per-node keypair on-device when it mints a receipt — try it with <span className="inline-flex items-center gap-1 align-middle"><code className="rounded bg-[color:var(--color-void-2)] px-1 py-0.5 text-[12px]">stratos trace demo/proj/wf/task1</code><CopyButton text="stratos trace demo/proj/wf/task1" variant="icon" ariaLabel="Copy command: stratos trace demo/proj/wf/task1" /></span>. Keys never leave the machine, and the receipt verifies with the public key alone.</> },
              { title: "Join the mesh", body: <>The mesh transport announces on the public DHT and hole-punches to peers — all outbound, no inbound port ever opened. Broad multi-device meshing is still wiring (see the honest status split below).</> },
              { title: "Come online across channels", body: "Once meshed, the agent is reachable on the channels you configure — the same StratosAgent behind every front door." },
            ]}
          />

          <DeepCard icon={WifiOff} title="What it does NOT do">
            <ul className="space-y-2.5">
              {[
                "Open an inbound port or run a public listener",
                "Require a cloud account, VPS, or static IP",
                "Upload your keys, prompts, or data anywhere by default",
                "Forward traffic through a relay that can read it",
              ].map((p) => (
                <li key={p} className="flex gap-2.5 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
                  <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-signal)]" />
                  {p}
                </li>
              ))}
            </ul>
          </DeepCard>
        </div>
      </DeepSection>

      {/* 03 — requirements */}
      <DeepSection
        index="03"
        kicker="Requirements"
        title="What you need to run a node"
        lede="Modest. A node is meant to run on the hardware you already own — a laptop is enough to get started. The frontier cloud is optional and bring-your-own-key."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <DeepCard icon={Server} title="Operating system">
            macOS, Linux, or Windows. The quickstart above covers all three; only the shell syntax
            differs.
          </DeepCard>
          <DeepCard icon={HardDrive} title="Disk">
            Room for the runtime plus the content-addressed blocks your node holds and serves. Grows with
            what you choose to keep.
          </DeepCard>
          <DeepCard icon={Cpu} title="Local inference (optional)">
            Local-first routing benefits from a capable CPU/GPU, but the router falls back gracefully —
            light work resolves anywhere.
          </DeepCard>
          <DeepCard icon={KeyRound} title="Frontier key (optional)">
            Only needed if you want cloud escalation. It&apos;s bring-your-own-key, gated by cost, and
            never the default.
          </DeepCard>
        </div>
      </DeepSection>

      {/* 04 — what's live, honestly */}
      <DeepSection
        index="04"
        kicker="The honest install"
        title="What's live the moment you install"
        lede="The install flow is in early access, opening at launch. Here's the honest split of what comes up live versus what's still wiring — straight from the status matrix."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <DeepCard icon={Lock} title="Vault & post-quantum keys" level="live"
            points={["Secrets sealed at rest (AES-GCM)", "Derived keys zeroed after use", "ML-DSA-65 seals on skills & receipts"]}>
            The cryptographic substrate is live: your keys are generated and sealed locally from the first
            run.
          </DeepCard>
          <DeepCard icon={Network} title="Mesh transport" level="wired"
            points={["Hyperswarm DHT + hole-punch", "Per-platform bundles built", "Broad multi-device runs still early"]}>
            DHT discovery and hole-punch transport are wired and bundled per platform; wide multi-device
            meshing is still maturing — and we say so.
          </DeepCard>
          <DeepCard icon={MessageSquare} title="Agent channels" level="live"
            points={["Telegram, Discord, Slack, Matrix, Signal", "Daemon-started adapters", "Owner-gated authority"]}>
            The five channel adapters are live and daemon-started. The agent answers across all of them,
            with fail-closed owner-gating.
          </DeepCard>
        </div>

        <Reveal>
          <div className="data-card mt-5 flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
              The installer endpoints shown above are the launch quickstart. Early access is{" "}
              <strong className="text-[color:var(--color-ink)]">opening at launch</strong> — request access
              and we&apos;ll bring you online.
            </p>
            <StatusBadge level="standalone" title="Install flow: built and tested; live access opens at launch." />
          </div>
        </Reveal>

        <div className="mt-8">
          <StatusLegend />
        </div>
      </DeepSection>

      <SubPageCTA
        kicker="Get early access"
        title={<>Run it on <span className="aurora-text">your own metal</span>.</>}
        body="Request early access and we'll bring your node online. Or read exactly what's live today before you do."
        primary={{ label: "Request early access", href: "mailto:hello@efficientlabs.ai?subject=Early%20access%20—%20The%20Atmosphere" }}
        secondary={{ label: "See what's live today", href: "/status" }}
      />
    </PageShell>
  );
}
