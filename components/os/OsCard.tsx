"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusChip from "./StatusChip";
import type { StatusLevel } from "@/data/docs";

/**
 * OsCard — the base surface for every OS module tile.
 * Wraps .lm-card (feature surface) or .data-card (flat HUD surface).
 *
 * - icon          → rendered in a glass chip, top-left
 * - stat          → optional big metric, top-right (.display)
 * - statusLevel   → honest level badge in the header (via StatusChip)
 * - statusLabel   → custom label for that badge
 * - href          → makes the whole card a link (+ is-interactive hover)
 * - interactive   → opt into hover-lift without an href
 * - locked        → dims + swaps the footer CTA to "Sign in to connect"
 */
export default function OsCard({
  title,
  icon: Icon,
  stat,
  statusLevel,
  statusLabel,
  footer,
  interactive,
  href,
  locked,
  variant = "lm",
  className,
  children,
}: {
  title?: string;
  icon?: LucideIcon;
  stat?: ReactNode;
  statusLevel?: StatusLevel;
  statusLabel?: string;
  footer?: ReactNode;
  interactive?: boolean;
  href?: string;
  locked?: boolean;
  variant?: "lm" | "data";
  className?: string;
  children?: ReactNode;
}) {
  const base = variant === "lm" ? "lm-card" : "data-card";
  const clickable = Boolean(href) || interactive;

  const inner = (
    <div
      className={cn(
        base,
        "group flex h-full flex-col p-6",
        clickable && "is-interactive",
        locked && "opacity-70",
        className,
      )}
    >
      {(Icon || stat || statusLevel) && (
        <div className="flex items-start justify-between gap-3">
          {Icon && (
            <div className="glass grid h-10 w-10 place-items-center rounded-xl text-[color:var(--color-signal)]">
              <Icon size={18} />
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            {statusLevel && <StatusChip level={statusLevel} label={statusLabel} />}
            {stat != null && (
              <span className="display text-[1.4rem] text-[color:var(--color-ink)]">{stat}</span>
            )}
          </div>
        </div>
      )}

      {title && (
        <h3 className="mt-4 text-[15px] font-semibold text-[color:var(--color-ink)]">{title}</h3>
      )}

      {children && (
        <div className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
          {children}
        </div>
      )}

      {locked ? (
        <span className="mono mt-4 inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-faint)]">
          <Lock size={12} /> Sign in to connect
        </span>
      ) : (
        footer && <div className="mt-4">{footer}</div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={locked ? "/login" : href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return inner;
}
