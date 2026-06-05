"use client";
// CodeBlock — language label + copy button. Optional tabbed variant. No syntax
// highlighting dependency; plain monospace on a darker-than-page fill.
import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Tab = { label: string; lang: string; code: string };

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      aria-label={copied ? "Copied" : "Copy code"}
      className="mono inline-flex items-center gap-1.5 rounded-[var(--radius-xs)] border border-[color:var(--color-line)] px-2 py-1 text-[11px] text-[color:var(--color-ink-faint)] transition-colors hover:border-[color:var(--color-edge)] hover:text-[color:var(--color-ink-dim)]"
    >
      {copied ? <Check size={13} aria-hidden style={{ color: "var(--color-signal)" }} /> : <Copy size={13} aria-hidden />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function Pre({ code }: { code: string }) {
  return (
    <pre
      className="mono overflow-x-auto px-4 py-3.5 text-[color:var(--color-ink)]"
      style={{ fontSize: "0.82rem", lineHeight: 1.65, margin: 0 }}
    >
      <code>{code}</code>
    </pre>
  );
}

export default function CodeBlock({
  lang,
  code,
  tabs,
}: {
  lang?: string;
  code?: string;
  tabs?: Tab[];
}) {
  const [active, setActive] = useState(0);

  if (tabs && tabs.length) {
    const cur = tabs[active];
    return (
      <div
        className="my-6 overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)]"
        style={{ background: "#05070c" }}
      >
        <div className="flex items-center justify-between border-b border-[color:var(--color-line)] pl-1.5 pr-2">
          <div role="tablist" aria-label="Code examples" className="flex">
            {tabs.map((t, i) => (
              <button
                key={t.label}
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className="mono px-3 py-2 text-[11px] uppercase tracking-wider transition-colors"
                style={{
                  color: i === active ? "var(--color-ink)" : "var(--color-ink-faint)",
                  borderBottom: i === active ? "2px solid var(--color-signal)" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <CopyButton code={cur.code} />
        </div>
        <Pre code={cur.code} />
      </div>
    );
  }

  return (
    <div
      className="my-6 overflow-hidden rounded-[var(--radius)] border border-[color:var(--color-line)]"
      style={{ background: "#05070c" }}
    >
      <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-3 py-1.5">
        <span className="mono text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
          {lang ?? "text"}
        </span>
        <CopyButton code={code ?? ""} />
      </div>
      <Pre code={code ?? ""} />
    </div>
  );
}
