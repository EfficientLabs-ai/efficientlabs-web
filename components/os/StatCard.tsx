"use client";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import StatusChip, { type StatusTone } from "./StatusChip";
import type { StatusLevel } from "@/data/docs";

/**
 * StatCard — the dense top-of-module metric card (Causal/Mixpanel/Attio pattern).
 * Anatomy, top→bottom: mono uppercase label (11px, --ink-faint) · big .t-stat
 * numeral · an honest StatusChip (NOT a fabricated delta).
 *
 * Honesty rule: when a number isn't real yet, pass value="—" + muted and a chip
 * (e.g. statusTone="preview" / a level / a "not measured" label) so the card
 * reads as "nothing here yet" rather than inventing a figure or a delta.
 *
 * All surface colours are token-driven (--color-void-2 / --color-line /
 * --shadow-hud) so the card flips with the OS light/dark theme automatically.
 */
export default function StatCard({
  icon: Icon,
  label,
  value,
  statusLevel,
  statusLabel,
  statusTone,
  muted,
}: {
  icon?: LucideIcon;
  label: string;
  value: ReactNode;
  statusLevel?: StatusLevel;
  statusLabel?: string;
  statusTone?: StatusTone;
  muted?: boolean;
}) {
  const showChip = Boolean(statusLevel || statusLabel || statusTone);
  return (
    <div
      className="flex flex-col rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)] p-4"
      style={{ boxShadow: "var(--shadow-hud)" }}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon size={13} className="shrink-0 text-[color:var(--color-ink-faint)]" />
        )}
        <span className="mono truncate text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
          {label}
        </span>
      </div>
      <div
        className={cn(
          "t-stat mt-2.5 text-[1.7rem]",
          muted ? "text-[color:var(--color-ink-faint)]" : "text-[color:var(--color-ink)]",
        )}
      >
        {value}
      </div>
      {showChip && (
        <div className="mt-2.5">
          <StatusChip
            level={statusLevel}
            label={statusLabel}
            tone={statusLevel ? undefined : statusTone}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
