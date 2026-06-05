"use client";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * StatPill — a compact metric card, internals mirror the ops KPI card.
 * Use `muted` for preview / zero / not-connected states so the number reads
 * as "nothing here yet" rather than a fabricated figure.
 */
export default function StatPill({
  icon: Icon,
  label,
  value,
  sub,
  delta,
  up,
  muted,
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  sub?: string;
  delta?: string;
  up?: boolean;
  muted?: boolean;
}) {
  return (
    <div className={cn("lm-card p-5", muted && "opacity-80")}>
      <div className="flex items-center justify-between">
        {Icon && (
          <div className="glass grid h-9 w-9 place-items-center rounded-lg text-[color:var(--color-signal)]">
            <Icon size={16} />
          </div>
        )}
        {delta && (
          <span
            className={cn(
              "mono inline-flex items-center gap-0.5 text-[12px]",
              up ? "text-[color:var(--color-signal)]" : "text-[#e0566a]",
            )}
          >
            {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {delta}
          </span>
        )}
      </div>
      <div
        className={cn(
          "display mt-4 text-[1.9rem]",
          muted ? "text-[color:var(--color-ink-faint)]" : "text-[color:var(--color-ink)]",
        )}
      >
        {value}
      </div>
      <div className="mono mt-1 text-[11px] text-[color:var(--color-ink-faint)]">
        {label}
        {sub ? ` · ${sub}` : ""}
      </div>
    </div>
  );
}
