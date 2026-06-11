// §D — RUNTIME INTELLIGENCE. Scalars first, structure second (research P5):
// four metric cards (value + verdict word + truth label + freshness), then the
// routing-rung histogram. Numbers come ONLY from data/public-status.json; the
// method lines and honesty notes render verbatim — they ARE the brand voice.
import type { RoutingTile, EconomicsTile, IntelligenceTile } from "@/lib/public-status";
import { LabelChip, UpdatedAt, VerifyLine, NotMeasuredCard, VERDICT } from "@/components/proof/bits";

function MetricCard({
  value, unit, label, sub, updatedAt, accent,
}: {
  value: string; unit?: string; label: string; sub: string;
  updatedAt?: string | null; accent?: string;
}) {
  return (
    <div className="lm-card flex flex-col gap-1 p-5">
      <span className="display leading-none text-[clamp(1.7rem,4.5vw,2.3rem)]" style={{ color: accent ?? "var(--color-ink)" }}>
        {value}
        {unit && <span className="ml-1 text-[0.55em] text-[color:var(--color-ink-faint)]">{unit}</span>}
      </span>
      <span className="mono text-[12px] text-[color:var(--color-ink)]">{label}</span>
      <span className="text-[11px] leading-snug text-[color:var(--color-ink-faint)]">{sub}</span>
      <span className="mt-1 flex items-center gap-2">
        <LabelChip label="MEASURED" />
        <UpdatedAt updatedAt={updatedAt} />
      </span>
    </div>
  );
}

export default function RuntimeIntelligence({
  routing, economics, intelligence,
}: {
  routing: RoutingTile; economics: EconomicsTile; intelligence: IntelligenceTile;
}) {
  const skillReuse = intelligence.counters?.skill_reuse_events;
  const rungEntries = routing.rungs
    ? Object.entries(routing.rungs).sort(([a], [b]) => Number(a) - Number(b))
    : [];
  const rungMax = Math.max(1, ...rungEntries.map(([, n]) => n));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {economics.label === "MEASURED" ? (
          <MetricCard
            value={String(economics.weighted_cache_hit_pct)} unit="%"
            label="cache hit"
            sub={`weighted across ${economics.sessions} sessions — provider-reported`}
            updatedAt={economics.updated_at} accent="var(--color-signal)"
          />
        ) : (
          <NotMeasuredCard title="cache hit" reason={economics.reason} />
        )}
        {routing.label === "MEASURED" ? (
          <MetricCard
            value={String(routing.rung1_pct)} unit="%"
            label="ran as scripts"
            sub={`of ${routing.total} logged routing decisions — rung 1, no model at all`}
            updatedAt={routing.updated_at}
          />
        ) : (
          <NotMeasuredCard title="routing" reason={routing.reason} />
        )}
        {routing.label === "MEASURED" ? (
          <MetricCard
            value={`${routing.flagship_avoided}`}
            label="flagship avoided"
            sub={`vs ${routing.flagship_used} flagship calls — cheapest rung that can do the work`}
            updatedAt={routing.updated_at}
          />
        ) : (
          <NotMeasuredCard title="flagship avoided" reason={routing.reason} />
        )}
        {routing.label === "MEASURED" ? (
          <MetricCard
            value={String(routing.flagship_on_deterministic)}
            label="flagship on deterministic work"
            sub="the heartbeat turns RED if this is ever not zero"
            updatedAt={routing.updated_at}
            accent={routing.flagship_on_deterministic === 0 ? VERDICT.GREEN : VERDICT.RED}
          />
        ) : (
          <NotMeasuredCard title="flagship discipline" reason={routing.reason} />
        )}
      </div>

      {/* ── routing-rung histogram ── */}
      {routing.label === "MEASURED" && rungEntries.length > 0 && (
        <div className="lm-card mt-3 p-5">
          <div className="flex items-center justify-between">
            <span className="mono text-[12px] text-[color:var(--color-ink)]">routing ladder — work goes to the cheapest rung that can do it</span>
            <span className="mono text-[10px] text-[color:var(--color-ink-faint)]">rung 1 = scripts · rung 8 = flagship</span>
          </div>
          <div className="mt-4 flex items-end gap-2" style={{ height: "5.5rem" }}>
            {rungEntries.map(([rung, n]) => (
              <div key={rung} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="mono text-[10px] text-[color:var(--color-ink-faint)]">{n}</span>
                <div
                  className="w-full max-w-10 rounded-t-sm"
                  style={{
                    height: `${(n / rungMax) * 100}%`,
                    minHeight: 3,
                    background: rung === "1" ? "var(--color-signal)" : "color-mix(in oklab, var(--color-signal) 35%, transparent)",
                  }}
                />
                <span className="mono text-[10px] text-[color:var(--color-ink-faint)]">r{rung}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-snug text-[color:var(--color-ink-faint)]">{routing.method}.</p>
          <VerifyLine verify={routing.verify} />
        </div>
      )}

      {/* ── reuse counters — nulls render as nulls ── */}
      {intelligence.label === "MEASURED" && (
        <p className="mono mt-3 text-[11px] text-[color:var(--color-ink-faint)]">
          {typeof skillReuse?.value === "number" && <>skill-reuse events: {skillReuse.value} (MEASURED) · </>}
          counters whose source is not instrumented are published as null — they render as nothing, never as a guess.
        </p>
      )}
    </div>
  );
}
