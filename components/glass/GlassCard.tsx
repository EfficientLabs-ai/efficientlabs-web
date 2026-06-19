import { type ReactNode } from "react";

/**
 * GlassCard — the reusable frosted-glass surface for the landing renovation.
 * Wraps the token-driven `.lm-card` / `.data-card` materials from globals.css
 * (backdrop-blur + saturate, hairline border, layered shadow with the lit-edge
 * inset highlight). Server-rendered; no JS, no tweened filters — the blur is a
 * static CSS material, so this is reduced-motion- and no-JS-safe by default.
 *
 *  - material="lm"   → liquid-metal chrome ring sweep on hover (feature cards)
 *  - material="flat" → flat frosted data surface (quieter, denser grids)
 *  - interactive     → opt into the hover lift (only for genuinely clickable cards)
 */
export default function GlassCard({
  children,
  material = "lm",
  interactive = false,
  as: Tag = "div",
  className = "",
  style,
  ...rest
}: {
  children: ReactNode;
  material?: "lm" | "flat";
  interactive?: boolean;
  as?: "div" | "li" | "article";
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLAttributes<HTMLElement>) {
  const base = material === "lm" ? "lm-card" : "data-card";
  return (
    <Tag
      className={`${base}${interactive ? " is-interactive" : ""} ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </Tag>
  );
}
