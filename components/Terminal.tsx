"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import CopyButton from "@/components/CopyButton";

export type TermLine = { p?: string; t: string; c?: "cmd" | "out" | "ok" | "dim" | "hash" };

const OS_LABELS: Record<string, string> = { mac: "macOS", linux: "Linux", win: "Windows" };

export default function Terminal({
  title = "stratos",
  tabs,
  active,
  onTab,
  lines,
  copyText,
  perCommandCopy = false,
}: {
  title?: string;
  tabs?: string[];
  active?: string;
  onTab?: (os: string) => void;
  lines: TermLine[];
  copyText?: string;
  /** When true, every `cmd` line gets its OWN one-click copy button that copies exactly that line. */
  perCommandCopy?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText ?? lines.filter((l) => l.c === "cmd").map((l) => l.t).join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard blocked — no-op */ }
  };

  const color = (c?: TermLine["c"]) =>
    c === "ok" ? "var(--color-signal)"
    : c === "hash" ? "var(--color-quantum)"
    : c === "dim" ? "var(--color-ink-faint)"
    : c === "out" ? "var(--color-ink-dim)"
    : "var(--color-ink)";

  return (
    <div className="lm-card overflow-hidden text-left">
      {/* window chrome */}
      <div className="flex items-center justify-between gap-2 border-b border-[color:rgba(255,255,255,0.06)] px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
          </span>
          <span className="mono truncate text-[12px] text-[color:var(--color-ink-faint)]">{title}</span>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {tabs && (
            <div className="flex items-center gap-1 rounded-lg border border-[color:rgba(255,255,255,0.07)] p-0.5">
              {tabs.map((os) => (
                <button
                  key={os}
                  onClick={() => onTab?.(os)}
                  className={`mono rounded-md px-2.5 py-1 text-[11px] transition-colors ${
                    active === os
                      ? "bg-[color:var(--color-signal)]/15 text-[color:var(--color-signal)]"
                      : "text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink-dim)]"
                  }`}
                >
                  {OS_LABELS[os] ?? os}
                </button>
              ))}
            </div>
          )}
          <button onClick={copy} aria-label="Copy commands"
            className="mono inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-signal)]">
            {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "copied" : "copy"}
          </button>
        </div>
      </div>

      {/* body */}
      <div className="mono space-y-1.5 px-5 py-5 text-[13px] leading-relaxed">
        {lines.map((l, i) => {
          const isCmd = l.c === "cmd";
          return (
            <div key={i} className="group flex items-start gap-2">
              {l.p && <span className="shrink-0 select-none text-[color:var(--color-signal)]">{l.p}</span>}
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-all" style={{ color: color(l.c) }}>{l.t}</span>
              {perCommandCopy && isCmd && (
                <CopyButton
                  text={l.t}
                  variant="icon"
                  ariaLabel={`Copy command: ${l.t}`}
                  className="mt-px opacity-60 transition-opacity hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
