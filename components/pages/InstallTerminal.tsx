"use client";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import Terminal, { type TermLine } from "@/components/Terminal";

// The quickstart command sets — kept identical in spirit to the homepage Install
// terminal, but this is the standalone deep-page version with its own per-OS copy
// payloads and a third macOS/Linux split made explicit.
const MAC: TermLine[] = [
  { t: "# 1 · install the Atmosphere runtime", c: "dim" },
  { p: "$", t: "curl -fsSL https://get.efficientlabs.ai | sh", c: "cmd" },
  { t: "✓ Atmosphere runtime ready · no open ports", c: "ok" },
  { t: "# 2 · bring StratosAgent online on hardware you own", c: "dim" },
  { p: "$", t: "stratos init && stratos up", c: "cmd" },
  { t: "✓ node live · meshed P2P · post-quantum keys sealed", c: "ok" },
  { t: "→ reachable on Telegram, Discord, Slack, Matrix, Signal", c: "out" },
];

const LINUX: TermLine[] = [
  { t: "# 1 · install the Atmosphere runtime", c: "dim" },
  { p: "$", t: "curl -fsSL https://get.efficientlabs.ai | sh", c: "cmd" },
  { t: "✓ Atmosphere runtime ready · no open ports", c: "ok" },
  { t: "# 2 · bring StratosAgent online (systemd user service)", c: "dim" },
  { p: "$", t: "stratos init && stratos up", c: "cmd" },
  { t: "✓ node live · meshed P2P · post-quantum keys sealed", c: "ok" },
  { t: "→ reachable on Telegram, Discord, Slack, Matrix, Signal", c: "out" },
];

const WIN: TermLine[] = [
  { t: "# 1 · install the Atmosphere runtime", c: "dim" },
  { p: ">", t: "irm https://get.efficientlabs.ai/win | iex", c: "cmd" },
  { t: "✓ Atmosphere runtime ready · no open ports", c: "ok" },
  { t: "# 2 · bring StratosAgent online on hardware you own", c: "dim" },
  { p: ">", t: "stratos init; stratos up", c: "cmd" },
  { t: "✓ node live · meshed P2P · post-quantum keys sealed", c: "ok" },
  { t: "→ reachable on Telegram, Discord, Slack, Matrix, Signal", c: "out" },
];

const COPY: Record<string, string> = {
  mac: "curl -fsSL https://get.efficientlabs.ai | sh\nstratos init && stratos up",
  linux: "curl -fsSL https://get.efficientlabs.ai | sh\nstratos init && stratos up",
  win: "irm https://get.efficientlabs.ai/win | iex\nstratos init; stratos up",
};

export default function InstallTerminal() {
  const [os, setOs] = useState<"mac" | "linux" | "win">("mac");
  const lines = os === "win" ? WIN : os === "linux" ? LINUX : MAC;

  return (
    <Reveal>
      <div className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.07] px-3 py-1.5">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--color-signal)]" />
        <span className="mono text-[11px] tracking-wider text-[color:var(--color-signal)]">EARLY ACCESS · OPENING AT LAUNCH</span>
      </div>
      <div className="mt-4">
        <Terminal
          title="stratos — quickstart"
          tabs={["mac", "linux", "win"]}
          active={os}
          onTab={(o) => setOs(o as typeof os)}
          lines={lines}
          copyText={COPY[os]}
        />
      </div>
      <p className="mono mt-3 text-[11px] leading-relaxed text-[color:var(--color-ink-faint)]">
        Two commands. No firewall holes, no inbound ports, nothing exposed to the public internet.
      </p>
    </Reveal>
  );
}
