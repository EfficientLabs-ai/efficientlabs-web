"use client";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import Terminal, { type TermLine } from "@/components/Terminal";

// The quickstart command sets — kept identical in spirit to the homepage Install
// terminal, but this is the standalone deep-page version with its own per-OS copy
// payloads and a third macOS/Linux split made explicit.
const NIX: TermLine[] = [
  { t: "# 1 · install the StratosAgent CLI (user-space, no sudo)", c: "dim" },
  { p: "$", t: "curl -fsSL https://efficientlabs.ai/install.sh | sh", c: "cmd" },
  { t: "✓ @efficientlabs/stratos@1.1.0 installed · nothing auto-started", c: "ok" },
  { t: "# 2 · set up your node, then a real local completion *", c: "dim" },
  { p: "$", t: "stratos init", c: "cmd" },
  { p: "$", t: "stratos task create local/demo/flow/t1", c: "cmd" },
  { p: "$", t: "stratos complete local/demo/flow/t1 \"what is sovereign AI?\"", c: "cmd" },
  { t: "✓ completion · local · $0 · PQC-signed receipt verified (public key only)", c: "ok" },
  { t: "* needs a local OpenAI-compatible endpoint (e.g. Ollama) via STRATOS_GATEWAY_URL", c: "dim" },
];
const MAC = NIX;
const LINUX = NIX;

const WIN: TermLine[] = [
  { t: "# 1 · install the StratosAgent CLI (PowerShell, no admin)", c: "dim" },
  { p: ">", t: "irm https://efficientlabs.ai/install.ps1 | iex", c: "cmd" },
  { t: "✓ @efficientlabs/stratos@1.1.0 installed · nothing auto-started", c: "ok" },
  { t: "# 2 · set up your node, then a real local completion *", c: "dim" },
  { p: ">", t: "stratos init", c: "cmd" },
  { p: ">", t: "stratos task create local/demo/flow/t1", c: "cmd" },
  { p: ">", t: "stratos complete local/demo/flow/t1 \"what is sovereign AI?\"", c: "cmd" },
  { t: "✓ completion · local · $0 · PQC-signed receipt verified (public key only)", c: "ok" },
  { t: "* needs a local OpenAI-compatible endpoint (e.g. Ollama) via $env:STRATOS_GATEWAY_URL", c: "dim" },
];

const COPY: Record<string, string> = {
  mac: "curl -fsSL https://efficientlabs.ai/install.sh | sh\nstratos init\nstratos task create local/demo/flow/t1\nstratos complete local/demo/flow/t1 \"what is sovereign AI?\"",
  linux: "curl -fsSL https://efficientlabs.ai/install.sh | sh\nstratos init\nstratos task create local/demo/flow/t1\nstratos complete local/demo/flow/t1 \"what is sovereign AI?\"",
  win: "irm https://efficientlabs.ai/install.ps1 | iex\nstratos init\nstratos task create local/demo/flow/t1\nstratos complete local/demo/flow/t1 \"what is sovereign AI?\"",
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
          perCommandCopy
        />
      </div>
      <p className="mono mt-3 text-[11px] leading-relaxed text-[color:var(--color-ink-faint)]">
        Two commands. No firewall holes, no inbound ports, nothing exposed to the public internet.
      </p>
    </Reveal>
  );
}
