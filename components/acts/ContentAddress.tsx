"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ActHeader, Reveal } from "@/components/Reveal";
import Terminal, { type TermLine } from "@/components/Terminal";

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const SEED = `{
  "skill": "audit.classify",
  "version": "1.4.0",
  "deps": ["sha256", "ml-dsa-65"]
}`;

// the command each shell uses to reproduce the address on the user's own machine
function osLines(os: string, hash: string): TermLine[] {
  const h = hash || "…".repeat(8);
  if (os === "win") return [
    { p: ">", t: "Get-FileHash skill.json -Algorithm SHA256", c: "cmd" },
    { t: "Algorithm  Hash", c: "dim" },
    { t: `SHA256     ${h.toUpperCase()}`, c: "hash" },
    { t: "✓ matches the address above — byte-for-byte", c: "ok" },
  ];
  if (os === "linux") return [
    { p: "$", t: "sha256sum skill.json", c: "cmd" },
    { t: `${h}  skill.json`, c: "hash" },
    { t: "✓ matches the address above — byte-for-byte", c: "ok" },
  ];
  return [
    { p: "$", t: "shasum -a 256 skill.json", c: "cmd" },
    { t: `${h}  skill.json`, c: "hash" },
    { t: "✓ matches the address above — byte-for-byte", c: "ok" },
  ];
}

export default function ContentAddress() {
  const [content, setContent] = useState(SEED);
  const [hash, setHash] = useState("");
  const [os, setOs] = useState<"mac" | "linux" | "win">("mac");

  useEffect(() => {
    let alive = true;
    sha256(content).then((h) => alive && setHash(h));
    return () => { alive = false; };
  }, [content]);

  const addr = hash ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : "computing…";

  return (
    <div className="space-y-12">
      <div className="grid items-center gap-14 [&>*]:min-w-0 lg:grid-cols-2">
        <ActHeader index="01" kicker="Content addressing" title={<>Verify anything <span className="aurora-text">yourself</span>.</>}>
          Every skill, artifact and message is named by the SHA-256 of its bytes — so a name can
          never point to something it didn&apos;t mean. Edit the block; the address re-derives live in
          your browser. Then reproduce that exact hash on your own machine with one command.
        </ActHeader>

        <Reveal delay={0.1}>
          <div className="glass rounded-[var(--radius-lg)] p-1.5 shadow-[var(--shadow-hud)]">
            <div className="flex items-center gap-1.5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2a3340]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#2a3340]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#2a3340]" />
              <span className="mono ml-3 text-[11px] text-[color:var(--color-ink-faint)]">skill.json — editable</span>
            </div>
            <textarea
              spellCheck={false}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="mono w-full resize-none bg-transparent px-4 pb-4 text-[13px] leading-relaxed text-[color:var(--color-ink)] outline-none"
            />
            <div className="flex items-center gap-3 border-t border-[color:rgba(255,255,255,0.06)] px-4 py-4">
              <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">addr</span>
              <span aria-hidden className="text-[color:var(--color-ink-faint)]">→</span>
              <motion.code key={addr} initial={{ opacity: 0.35 }} animate={{ opacity: 1 }}
                className="mono flex-1 truncate text-[13px] text-[color:var(--color-signal)]">
                {addr}
              </motion.code>
              <span className="mono rounded-[var(--radius-sm)] border border-[color:var(--color-signal-deep)]/40 bg-[color:var(--color-signal)]/10 px-2 py-0.5 text-[10px] text-[color:var(--color-signal)]">
                immutable
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* reproduce it on your own machine — OS-tabbed */}
      <Reveal delay={0.05}>
        <p className="mono mb-3 text-[12px] text-[color:var(--color-ink-faint)]">
          → reproduce the same address on your own machine
        </p>
        <Terminal
          title="verify — content address"
          tabs={["mac", "linux", "win"]}
          active={os}
          onTab={(o) => setOs(o as typeof os)}
          lines={osLines(os, hash)}
          perCommandCopy
          copyText={
            os === "win" ? "Get-FileHash skill.json -Algorithm SHA256"
            : os === "linux" ? "sha256sum skill.json"
            : "shasum -a 256 skill.json"
          }
        />
      </Reveal>
    </div>
  );
}
