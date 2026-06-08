// StatusBadge — maps a status.json level to a pill. The honesty primitive used
// inline in headings and feature lists so the docs visually never overclaim.
import { capLevel, levelLabel, levelBlurb, type StatusLevel } from "@/data/docs";

const STYLE: Record<StatusLevel, { fg: string; bg: string; border: string; dot: boolean }> = {
  live: { fg: "var(--color-signal)", bg: "color-mix(in oklab, var(--color-signal) 14%, transparent)", border: "color-mix(in oklab, var(--color-signal) 38%, transparent)", dot: true },
  wired: { fg: "var(--color-quantum)", bg: "color-mix(in oklab, var(--color-quantum) 12%, transparent)", border: "color-mix(in oklab, var(--color-quantum) 34%, transparent)", dot: false },
  config: { fg: "#ff9f6e", bg: "color-mix(in oklab, #ff9f6e 12%, transparent)", border: "color-mix(in oklab, #ff9f6e 34%, transparent)", dot: false },
  standalone: { fg: "var(--color-ink-dim)", bg: "transparent", border: "var(--border-hairline-strong)", dot: false },
  mock: { fg: "var(--color-ink-faint)", bg: "transparent", border: "var(--color-line)", dot: false },
};

export default function StatusBadge({ level, label }: { level: StatusLevel; label?: string }) {
  const s = STYLE[level];
  return (
    <span
      className="mono inline-flex items-center gap-1.5 align-middle"
      style={{
        fontSize: "0.7rem",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: s.fg,
        background: s.bg,
        border: typeof s.border === "string" && s.border.startsWith("1px") ? s.border : `1px solid ${s.border}`,
        borderRadius: "var(--radius-pill)",
        padding: "0.12rem 0.55rem",
        lineHeight: 1.5,
      }}
      title={levelBlurb(level)}
    >
      {s.dot && (
        <span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: s.fg, animation: "pulse-dot 2.2s ease-in-out infinite" }}
        />
      )}
      {label ?? levelLabel(level)}
    </span>
  );
}

/** Renders a capability row by name, pulling its honest level from status.json. */
export function CapStatus({ name }: { name: string }) {
  const level = capLevel(name);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 px-3.5 py-2.5">
      <span className="text-[13.5px] text-[color:var(--color-ink)]">{name}</span>
      {level ? <StatusBadge level={level} /> : <StatusBadge level="mock" label="Unknown" />}
    </div>
  );
}
