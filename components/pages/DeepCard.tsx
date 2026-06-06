import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import StatusBadge from "@/components/pages/StatusBadge";
import type { Level } from "@/lib/status";

/**
 * A dense feature card for the deep sub-pages: icon, title, optional honest
 * status badge, body, and an optional bullet list. Built on the site's
 * `.data-card` so it stays visually consistent with the homepage without
 * reusing any homepage section component 1:1.
 */
export default function DeepCard({
  icon: Icon,
  title,
  level,
  children,
  points,
  delay = 0,
}: {
  icon?: LucideIcon;
  title: string;
  level?: Level;
  children?: ReactNode;
  points?: string[];
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div className="data-card flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-signal)]/25 bg-[color:var(--color-signal)]/[0.06] text-[color:var(--color-signal)]">
                <Icon size={17} aria-hidden />
              </span>
            )}
            <h3 className="t-card">{title}</h3>
          </div>
          {level && <StatusBadge level={level} />}
        </div>

        {children && (
          <div className="mt-4 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">{children}</div>
        )}

        {points && points.length > 0 && (
          <ul className="mt-4 space-y-2.5">
            {points.map((p) => (
              <li key={p} className="flex gap-2.5 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
                <span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[color:var(--color-signal)]" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Reveal>
  );
}
