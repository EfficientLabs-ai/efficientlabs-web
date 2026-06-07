"use client";
import { useState } from "react";
import { Reveal, ActHeader } from "@/components/Reveal";
import Terminal, { type TermLine } from "@/components/Terminal";

const UNIX: TermLine[] = [
  { t: "# 1 · install the StratosAgent CLI (user-space, no sudo)", c: "dim" },
  { p: "$", t: "curl -fsSL https://efficientlabs.ai/install.sh | sh", c: "cmd" },
  { t: "✓ @efficientlabs/stratos installed · nothing auto-started", c: "ok" },
  { t: "# 2 · run the publicly-auditable operating core (no network)", c: "dim" },
  { p: "$", t: "stratos workspace create demo && stratos trace demo/proj/wf/task1", c: "cmd" },
  { t: "✓ trace written · PQC-signed receipt verified (public key only)", c: "ok" },
];

const WIN: TermLine[] = [
  { t: "# 1 · install the StratosAgent CLI via npm (needs Node 18+)", c: "dim" },
  { p: ">", t: "npm i -g @efficientlabs/stratos", c: "cmd" },
  { t: "✓ @efficientlabs/stratos installed · nothing auto-started", c: "ok" },
  { t: "# 2 · run the publicly-auditable operating core (no network)", c: "dim" },
  { p: ">", t: "stratos workspace create demo; stratos trace demo/proj/wf/task1", c: "cmd" },
  { t: "✓ trace written · PQC-signed receipt verified (public key only)", c: "ok" },
];

const STEPS = [
  ["One command", "A single installer brings up the Atmosphere runtime — no firewall holes, no inbound ports, nothing to expose."],
  ["Your hardware", "StratosAgent provisions on the machine you already own. Keys are generated locally and never leave it."],
  ["Meshed instantly", "Your node hole-punches into the global mesh and is reachable across every channel — still fully sovereign."],
];

export default function Install() {
  const [os, setOs] = useState<"mac" | "linux" | "win">("mac");
  const lines = os === "win" ? WIN : UNIX;

  return (
    <section id="install" className="section section-t relative scroll-mt-20 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full opacity-[0.10] blur-[120px]"
             style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
      </div>

      <div className="container-x relative">
        <ActHeader index="06" kicker="Install" title={<>Lives in your <span className="aurora-text">terminal</span>.</>}>
          Two commands stand up a sovereign node and put StratosAgent to work — right inside your
          shell, on your laptop, workstation, or any device you already own. It meshes with the world
          peer-to-peer, with nothing exposed to the public internet. <span className="text-[color:var(--color-ink)]">No
          cloud. No VPS. Ever.</span>
        </ActHeader>

        <div className="mt-12 grid gap-10 [&>*]:min-w-0 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* terminal */}
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.07] px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-signal)]" />
              <span className="mono text-[11px] tracking-wider text-[color:var(--color-signal)]">EARLY ACCESS · OPENING AT LAUNCH</span>
            </div>
            <div className="mt-4">
              <Terminal title="stratos — quickstart" tabs={["mac", "linux", "win"]} active={os}
                onTab={(o) => setOs(o as typeof os)} lines={lines} perCommandCopy />
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href="mailto:hello@efficientlabs.ai?subject=Early%20access%20—%20The%20Atmosphere" className="btn-signal">Install now<span aria-hidden>→</span></a>
              <a href="#status" className="btn-outline">See what&apos;s live today</a>
            </div>
          </Reveal>

          {/* steps */}
          <Reveal delay={0.1}>
            <ol className="space-y-4">
              {STEPS.map(([h, d], i) => (
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
      </div>
    </section>
  );
}
