// §A of the proof layer — the VERDICT BAR. One unmissable colored verdict
// answers "is the system healthy?" in under a second; the 26-check table is
// a native <details> expansion. The color is whatever the heartbeat said —
// YELLOW renders YELLOW; a status page that is always green is an ad.
import type { HeartbeatTile } from "@/lib/public-status";
import { VERDICT, CHECK_DOT } from "@/components/proof/palette";
import { LabelChip, UpdatedAt, VerifyLine, NotMeasuredCard } from "@/components/proof/bits";

export default function VerdictBar({ tile }: { tile: HeartbeatTile }) {
  if (tile.label === null || !tile.color) {
    return <NotMeasuredCard title="operating-layer heartbeat" reason={tile.reason} />;
  }
  const color = VERDICT[tile.color] ?? VERDICT.YELLOW;
  return (
    <div className="lm-card p-6" style={{ borderColor: `color-mix(in oklab, ${color} 30%, transparent)` }}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span
          className="mono inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-semibold"
          style={{ borderColor: `color-mix(in oklab, ${color} 45%, transparent)`, color }}
        >
          <span className="h-2 w-2 rounded-full" style={{ background: color }} />
          {tile.color}
        </span>
        <span className="mono text-[13px] text-[color:var(--color-ink)]">
          operating layer · {tile.fail} fail / {tile.warn} warn / {tile.ok} ok
        </span>
        <span className="ml-auto flex items-center gap-3">
          <UpdatedAt updatedAt={tile.updated_at} />
          <LabelChip label={tile.label} />
        </span>
      </div>

      {tile.checks && tile.checks.length > 0 && (
        <details className="group mt-4">
          <summary className="mono cursor-pointer list-none text-[11px] text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-ink)]">
            <span className="inline-block transition-transform group-open:rotate-90">▸</span>{" "}
            {tile.checks.length} checks — every state shown, warns included
          </summary>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {tile.checks.map((c) => (
              <li key={c.name} className="flex items-center gap-2 text-[12px] text-[color:var(--color-ink-dim)]">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: CHECK_DOT[c.status] }} />
                <span className="truncate">{c.name}</span>
                <span className="mono ml-auto text-[10px]" style={{ color: CHECK_DOT[c.status] }}>{c.status}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <VerifyLine verify={tile.verify} />
    </div>
  );
}
