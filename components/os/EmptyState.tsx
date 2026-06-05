"use client";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * EmptyState — an honest empty surface used wherever real data WOULD appear but
 * isn't connected yet. It labels itself truthfully ("Nothing connected yet")
 * and never fabricates rows.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[color:var(--color-line)] px-6 py-12 text-center">
      <div className="glass grid h-11 w-11 place-items-center rounded-xl text-[color:var(--color-ink-faint)]">
        <Icon size={20} />
      </div>
      <p className="text-[14px] font-medium text-[color:var(--color-ink-dim)]">{title}</p>
      {description && (
        <p className="max-w-sm text-[13px] leading-relaxed text-[color:var(--color-ink-faint)]">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
