"use client";
// CopyButton — one-click copy-to-clipboard for a single command / code block.
// Uses navigator.clipboard.writeText with a document.execCommand("copy") fallback
// for non-secure-context / older browsers. Shows a "Copied ✓" state for ~1.5s.
// Styled with the site's existing tokens so it reads correctly on the dark theme
// and on glass surfaces.
import { useState } from "react";
import { Check, Copy } from "lucide-react";

function writeClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback: hidden textarea + execCommand("copy").
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-9999px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (ok) resolve();
      else reject(new Error("execCommand copy failed"));
    } catch (e) {
      reject(e);
    }
  });
}

export default function CopyButton({
  text,
  label = "Copy",
  className,
  /** "bare" = text+icon inline (default); "icon" = compact square, icon-only */
  variant = "bare",
  /** override the accessible name (defaults derive from `text`) */
  ariaLabel,
}: {
  text: string;
  label?: string;
  className?: string;
  variant?: "bare" | "icon";
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    writeClipboard(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        /* clipboard blocked — stay silent rather than fake success */
      });
  };

  const a11y =
    ariaLabel ?? (copied ? "Copied to clipboard" : `Copy to clipboard: ${text}`);

  const base =
    "mono inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-xs)] " +
    "border border-[color:var(--color-line)] text-[color:var(--color-ink-faint)] " +
    "transition-colors hover:border-[color:var(--color-edge)] hover:text-[color:var(--color-ink-dim)] " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-[color:var(--color-signal)]";

  const sizing =
    variant === "icon" ? "h-7 w-7 p-0" : "px-2 py-1 text-[11px]";

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label={a11y}
      title={copied ? "Copied" : "Copy"}
      data-copied={copied || undefined}
      className={[base, sizing, className].filter(Boolean).join(" ")}
    >
      {copied ? (
        <Check size={13} aria-hidden style={{ color: "var(--color-signal)" }} />
      ) : (
        <Copy size={13} aria-hidden />
      )}
      {variant === "bare" && (
        <span>{copied ? "Copied ✓" : label}</span>
      )}
    </button>
  );
}
