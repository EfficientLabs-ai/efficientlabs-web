// §E — ACTIVATION & ROADMAP. The denominator pattern (research P18): "10 of 13
// at PRODUCTION — 3 gaps shown" beats "all systems go". Components carry their
// honest lifecycle state as a pill (DOCUMENTED → PRODUCTION); non-PRODUCTION
// rows are the credibility, so they are SHOWN, never filtered.
import type { ActivationTile } from "@/lib/public-status";
import { LabelChip, UpdatedAt, VerifyLine, NotMeasuredCard } from "@/components/proof/bits";

// Lifecycle vocabulary → pill colors. Order is the ladder itself.
const LIFECYCLE: Record<string, string> = {
  DOCUMENTED: "#5b6675",
  PARTIAL: "#ff9f6e",
  WIRED: "#86c5ff",
  ENFORCED: "#c9a24b",
  MEASURED: "#5b82ff", // quantum-text lift — this hex colors 10px pill TEXT (AA)
  PRODUCTION: "#3fd68f",
};
const pillColor = (status: string) =>
  LIFECYCLE[Object.keys(LIFECYCLE).find((k) => status.toUpperCase().startsWith(k)) ?? ""] ?? "#5b6675";

export default function ActivationRoadmap({ tile }: { tile: ActivationTile }) {
  if (tile.label === null || !tile.components) {
    return <NotMeasuredCard title="activation matrix" reason={tile.reason} />;
  }
  const gaps = tile.total! - tile.production!;
  return (
    <div className="lm-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[15px] text-[color:var(--color-ink)]">
          <span className="display text-[1.4rem]">{tile.production} of {tile.total}</span>{" "}
          <span className="mono text-[12px]">operating-layer components at PRODUCTION</span>
          <span className="mono text-[12px] text-[color:var(--color-ink-faint)]"> — {gaps} gap{gaps === 1 ? "" : "s"} shown below</span>
        </p>
        <span className="flex items-center gap-3">
          <UpdatedAt updatedAt={tile.updated_at} />
          <LabelChip label={tile.label} />
        </span>
      </div>

      <ul className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {tile.components.map((c) => {
          const color = pillColor(c.status);
          return (
            <li key={c.name} className="flex items-center gap-2 text-[12px] text-[color:var(--color-ink-dim)]">
              <span className="truncate">{c.name}</span>
              <span
                className="mono ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]"
                style={{ borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, color }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                {c.status.toUpperCase().split(" ")[0]}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mono mt-4 text-[10px] text-[color:var(--color-ink-faint)]">
        lifecycle ladder: DOCUMENTED → PARTIAL → WIRED → ENFORCED → MEASURED → PRODUCTION — a state is claimed only
        when its completion check passes.
      </p>
      <VerifyLine verify={tile.verify} />
    </div>
  );
}
