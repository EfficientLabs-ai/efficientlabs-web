// LAUNCH READINESS — the "how close to production" number, with its formula ON the tile.
// A readiness percentage is only honest if anyone can recompute it: three published pillars,
// unweighted mean, every gate listed with its actual state. The unchecked gates ARE the roadmap.
import type { TileLabel } from "@/lib/public-status";
import { VERDICT } from "@/components/proof/palette";
import { LabelChip, UpdatedAt, VerifyLine, NotMeasuredCard } from "@/components/proof/bits";

export type ReadinessTileData = {
  label: TileLabel;
  updated_at?: string | null;
  overall_pct?: number;
  pillars?: {
    launch_gates: { pct: number; done: number; total: number };
    operating_components: { pct: number; production: number; total: number };
    product_capabilities: { pct: number; counted: number };
  };
  gates?: { id: string; label: string; done: boolean }[];
  method?: string;
  verify?: string;
  reason?: string;
};

function Pillar({ name, pct, sub }: { name: string; pct: number; sub: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="mono text-[11px] text-[color:var(--color-ink)]">{name}</span>
        <span className="mono text-[12px] text-[color:var(--color-ink-dim)]">{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[color:var(--color-edge)]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-signal)" }} />
      </div>
      <span className="text-[10px] text-[color:var(--color-ink-faint)]">{sub}</span>
    </div>
  );
}

export default function ReadinessTile({ tile }: { tile: ReadinessTileData }) {
  if (tile.label !== "MEASURED" || tile.overall_pct == null || !tile.pillars) {
    return <NotMeasuredCard title="launch readiness" reason={tile.reason} />;
  }
  const p = tile.pillars;
  const open = (tile.gates || []).filter((g) => !g.done);
  return (
    <div className="lm-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="kicker">Launch readiness</p>
        <span className="flex items-center gap-3">
          <UpdatedAt updatedAt={tile.updated_at} />
          <LabelChip label={tile.label} />
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <span className="display leading-none text-[clamp(2.4rem,6vw,3.4rem)]" style={{ color: "var(--color-signal)" }}>
            {tile.overall_pct}<span className="text-[0.45em] text-[color:var(--color-ink-faint)]">%</span>
          </span>
          <p className="mono mt-1 text-[11px] text-[color:var(--color-ink-faint)]">
            unweighted mean of the three pillars — recompute it yourself from this page
          </p>
        </div>
        <div className="grid min-w-[16rem] flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
          <Pillar name="launch gates" pct={p.launch_gates.pct} sub={`${p.launch_gates.done} of ${p.launch_gates.total} done`} />
          <Pillar name="operating layer" pct={p.operating_components.pct} sub={`${p.operating_components.production} of ${p.operating_components.total} at PRODUCTION`} />
          <Pillar name="product capabilities" pct={p.product_capabilities.pct} sub={`${p.product_capabilities.counted} capabilities, level-weighted`} />
        </div>
      </div>

      {/* the unchecked gates ARE the roadmap — shown, never hidden */}
      {tile.gates && (
        <details className="group mt-5">
          <summary className="mono cursor-pointer list-none text-[11px] text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-ink)]">
            <span className="inline-block transition-transform group-open:rotate-90">▸</span>{" "}
            {tile.gates.length} launch gates — {open.length} still open (the open ones are the roadmap)
          </summary>
          <ul className="mt-3 space-y-1.5">
            {tile.gates.map((g) => (
              <li key={g.id} className="flex items-start gap-2 text-[12px] leading-snug text-[color:var(--color-ink-dim)]">
                <span className="mono mt-0.5 shrink-0 text-[11px]" style={{ color: g.done ? VERDICT.GREEN : "#5b6675" }}>
                  {g.done ? "✓" : "○"}
                </span>
                <span className={g.done ? "" : "text-[color:var(--color-ink-faint)]"}>{g.label}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {tile.method && (
        <p className="mono mt-4 text-[10px] leading-relaxed text-[color:var(--color-ink-faint)]">method: {tile.method}</p>
      )}
      <VerifyLine verify={tile.verify} />
    </div>
  );
}
