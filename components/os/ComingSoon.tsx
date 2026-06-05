"use client";
import { Construction } from "lucide-react";
import StatusChip from "./StatusChip";
import type { StatusLevel } from "@/data/docs";

/**
 * ComingSoon — an honest "not yet built" block. Never contains fake data.
 * If a real capability backs the intent, pass `level` for its honest badge;
 * otherwise it renders the "Coming soon" UI-state pill.
 */
export default function ComingSoon({
  title,
  description,
  level,
  eta,
}: {
  title: string;
  description?: string;
  level?: StatusLevel;
  eta?: string;
}) {
  return (
    <div
      className="data-card flex flex-col items-start gap-3 p-6"
      style={{ borderStyle: "dashed", borderColor: "var(--color-line)" }}
    >
      <div className="flex w-full items-center justify-between gap-3">
        <div className="glass grid h-10 w-10 place-items-center rounded-xl text-[color:var(--color-ink-dim)]">
          <Construction size={18} />
        </div>
        {level ? <StatusChip level={level} /> : <StatusChip tone="coming" />}
      </div>
      <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">{title}</h3>
      {description && (
        <p className="text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">{description}</p>
      )}
      {eta && (
        <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">Planned · {eta}</p>
      )}
    </div>
  );
}
