"use client";
import { useState } from "react";
import { Reveal } from "@/components/Reveal";
import Terminal, { type TermLine } from "@/components/Terminal";

// The quickstart command sets — kept identical in spirit to the homepage Install
// terminal, but this is the standalone deep-page version with its own per-OS copy
// payloads and a third macOS/Linux split made explicit.
const MAC: TermLine[] = [
  { t: "# 1 · install the StratosAgent CLI (user-space, no sudo)", c: "dim" },
  { p: "$", t: "curl -fsSL https://efficientlabs.ai/install.sh | sh", c: "cmd" },
  { t: "✓ @efficientlabs/stratos installed · nothing auto-started", c: "ok" },
  { t: "# 2 · run the publicly-auditable operating core (no network)", c: "dim" },
  { p: "$", t: "stratos workspace create demo && stratos trace demo/proj/wf/task1", c: "cmd" },
  { t: "✓ trace written · PQC-signed receipt verified (public key only)", c: "ok" },
];

const LINUX: TermLine[] = [
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

const COPY: Record<string, string> = {
  mac: "curl -fsSL https://efficientlabs.ai/install.sh | sh\nstratos workspace create demo && stratos trace demo/proj/wf/task1",
  linux: "curl -fsSL https://efficientlabs.ai/install.sh | sh\nstratos workspace create demo && stratos trace demo/proj/wf/task1",
  win: "npm i -g @efficientlabs/stratos\nstratos workspace create demo; stratos trace demo/proj/wf/task1",
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
