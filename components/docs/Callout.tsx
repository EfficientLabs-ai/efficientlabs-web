// Callout — admonition box. `planned` is the honesty primitive: any not-live
// feature gets wrapped or prefixed with it.
import { Info, Lightbulb, TriangleAlert, Clock } from "lucide-react";

type Variant = "note" | "tip" | "warning" | "planned";

const CONFIG: Record<Variant, { icon: typeof Info; accent: string; label: string }> = {
  note: { icon: Info, accent: "var(--color-ink-dim)", label: "Note" },
  tip: { icon: Lightbulb, accent: "var(--color-quantum-text)", label: "Tip" },
  warning: { icon: TriangleAlert, accent: "#f5b94a", label: "Warning" },
  planned: { icon: Clock, accent: "var(--color-signal)", label: "Planned" },
};

export default function Callout({
  variant = "note",
  title,
  children,
}: {
  variant?: Variant;
  title?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, accent, label } = CONFIG[variant];
  return (
    <div
      role="note"
      className="glass my-6 flex gap-3 rounded-[var(--radius)] p-4"
      style={{ borderLeft: `3px solid ${accent}` }}
    >
      <Icon size={18} aria-hidden style={{ color: accent, flex: "none", marginTop: "0.1rem" }} />
      <div className="min-w-0">
        <div className="mono mb-1 text-[0.72rem] uppercase tracking-[0.16em]" style={{ color: accent }}>
          {variant === "planned" ? "Planned" : title ?? label}
        </div>
        {variant === "planned" && title && (
          <div className="mb-1 text-[14px] font-semibold text-[color:var(--color-ink)]">{title}</div>
        )}
        <div className="text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">{children}</div>
      </div>
    </div>
  );
}
