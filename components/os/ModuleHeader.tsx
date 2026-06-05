"use client";
import type { ReactNode } from "react";
import StatusBadge from "@/components/docs/StatusBadge";
import type { StatusLevel } from "@/data/docs";

/**
 * ModuleHeader — the per-module page header (kicker + display title + status).
 * The honest status badge sits beside the title so a module can never present
 * itself as further along than it is. `actions` is a right-aligned slot.
 */
export default function ModuleHeader({
  kicker,
  title,
  description,
  statusLevel,
  statusLabel,
  actions,
}: {
  kicker: string;
  title: ReactNode;
  description?: string;
  statusLevel?: StatusLevel;
  statusLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="kicker">{kicker}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="display text-[clamp(1.6rem,3.4vw,2.4rem)] text-[color:var(--color-ink)]">
            {title}
          </h1>
          {statusLevel && <StatusBadge level={statusLevel} label={statusLabel} />}
        </div>
        {description && (
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
