"use client";
import StatusBadge from "@/components/docs/StatusBadge";
import { capLevel, type StatusLevel } from "@/data/docs";

/**
 * StatusChip — the honesty primitive for the OS surface.
 *
 * It NEVER reimplements the level styles; it wraps the canonical StatusBadge so
 * Live / Wired / Standalone / Mock can't drift. Two extra non-status UI states
 * ("Preview" / "Coming soon") are rendered as their own subtle pills.
 *
 * Resolution order:
 *   capName → look the level up in status.json (capLevel), badge it.
 *   level   → explicit level override, badge it (optional custom label).
 *   tone    → a UI-state pill ("preview" | "coming"), label customizable.
 */
export type StatusTone = "preview" | "coming";

export default function StatusChip({
  capName,
  level,
  label,
  tone,
  size = "md",
}: {
  capName?: string;
  level?: StatusLevel;
  label?: string;
  tone?: StatusTone;
  size?: "sm" | "md";
}) {
  // 1 — capability name → honest level from status.json
  if (capName) {
    return <StatusBadge level={capLevel(capName) ?? "mock"} label={label} />;
  }

  // 2 — explicit level override
  if (level) {
    return <StatusBadge level={level} label={label} />;
  }

  // 3 — UI-state pill (not a capability status)
  const t = tone ?? "preview";
  const fontSize = size === "sm" ? "0.65rem" : "0.7rem";
  const pad = size === "sm" ? "0.1rem 0.45rem" : "0.12rem 0.55rem";
  const style =
    t === "coming"
      ? {
          color: "var(--color-quantum-text)",
          background: "color-mix(in oklab, var(--color-quantum) 10%, transparent)",
          border: "1px solid color-mix(in oklab, var(--color-quantum) 30%, transparent)",
        }
      : {
          color: "var(--color-ink-faint)",
          background: "transparent",
          border: "var(--border-hairline-strong)",
        };

  return (
    <span
      className="mono inline-flex items-center gap-1.5 align-middle"
      style={{
        fontSize,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        borderRadius: "var(--radius-pill)",
        padding: pad,
        lineHeight: 1.5,
        ...style,
      }}
    >
      {label ?? (t === "coming" ? "Coming soon" : "Preview")}
    </span>
  );
}
