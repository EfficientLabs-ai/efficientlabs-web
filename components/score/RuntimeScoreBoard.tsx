// Runtime Score — the six MEASURED-only sub-scores, rendered verbatim from the
// efl.runtime-score.v1 artifact. Like components/proof/*, this is a TRUTH
// RENDERER: labels, verdicts, methods, and the not-measured registry come from
// the artifact; nothing is computed here beyond formatting.
//
// Restraint by spec (P6): no gauges sweeping, no animated count-ups. The hero
// ring is a static SVG whose only statement is the verdict and the honest
// denominator ("N of 6 measured" — it never silently fills in).
import { VERDICT } from "@/components/proof/palette";
import { LabelChip, UpdatedAt, VerifyLine } from "@/components/proof/bits";
import {
  BRIDGE,
  SCORE_ORDER,
  headlineScalar,
  type RuntimeScore,
  type SubScore,
  type Verdict,
} from "@/lib/runtime-score";

function HeroRing({ hero, generatedAt }: { hero: RuntimeScore["hero"]; generatedAt: string }) {
  // verdict null = the fail-closed 0-measured case: grey ring, honest words,
  // no invented color (the producer emits null deliberately — render it).
  const verdictText = hero.verdict ?? "not measured";
  const color = hero.verdict ? VERDICT[hero.verdict] : "#5b6675";
  // Ring fill = measured/total — the DENOMINATOR is the message, not a score number.
  const R = 56;
  const C = 2 * Math.PI * R;
  const filled = hero.total ? hero.measured / hero.total : 0;
  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-8">
      <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`Runtime Score: ${verdictText}, ${hero.measured} of ${hero.total} sub-scores measured`}>
        <circle cx="70" cy="70" r={R} fill="none" stroke="var(--color-line)" strokeWidth="6" />
        <circle
          cx="70" cy="70" r={R} fill="none"
          stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={`${C * filled} ${C}`}
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" className="mono" fill={color} fontSize={hero.verdict ? 18 : 12} fontWeight="600">
          {verdictText}
        </text>
        <text x="70" y="86" textAnchor="middle" className="mono" fill="var(--color-ink-faint)" fontSize="10">
          {hero.measured} of {hero.total} measured
        </text>
      </svg>
      <div className="max-w-md text-center sm:text-left">
        <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
          One verdict word for the whole runtime — composited from the <em>measured</em> sub-scores only.
          A yellow ring shown honestly beats a green ring assembled from hope.
        </p>
        <p className="mono mt-2 text-[10px] text-[color:var(--color-ink-faint)]">
          method: {hero.method}
          {generatedAt && <> · artifact generated {generatedAt.slice(0, 10)}</>}
        </p>
      </div>
    </div>
  );
}

function ScoreCard({ id, title, score }: { id: (typeof SCORE_ORDER)[number][0]; title: string; score: SubScore }) {
  // A card renders as measured ONLY with the full contract: label MEASURED and
  // a real verdict. Anything less is the designed grey state, in place —
  // absence is information (P7/P24); a verdict is never invented.
  const measured = score.label === "MEASURED" && !!score.verdict && score.verdict in VERDICT;
  if (!measured) {
    return (
      <div className="lm-card p-5 opacity-70">
        <div className="flex items-center justify-between gap-2">
          <span className="mono text-[12px] text-[color:var(--color-ink)]">{title}</span>
          <LabelChip label={null} />
        </div>
        <p className="mt-2 text-[12px] leading-snug text-[color:var(--color-ink-faint)]">
          {score.reason || "not measured"}
        </p>
      </div>
    );
  }
  const { value, caption } = headlineScalar(id, score);
  const verdict = score.verdict as Verdict;
  const bridge = verdict !== "GREEN" ? BRIDGE[id] : null;
  return (
    <div className="lm-card flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[12px] text-[color:var(--color-ink)]">{title}</span>
        <LabelChip label={score.label} />
      </div>
      {/* scalar first (P5), then label, then the verdict word (P2/P23) */}
      <div className="mt-3 text-[1.9rem] leading-none tracking-tight text-[color:var(--color-ink)]">{value}</div>
      <p className="mt-1.5 text-[12px] leading-snug text-[color:var(--color-ink-dim)]">{caption}</p>
      <div className="mt-2 flex items-center gap-2">
        <span className="mono text-[11px] font-semibold" style={{ color: VERDICT[verdict] }}>{verdict}</span>
        <UpdatedAt updatedAt={score.updated_at} />
      </div>
      {score.footnote && (
        <p className="mono mt-2 rounded border border-[color:var(--color-line)] px-2 py-1 text-[10px] text-[color:var(--color-ink-faint)]">
          {score.footnote}
        </p>
      )}
      {/* curves & breakdowns live behind the card (P5/P19) — disclosed, never animated */}
      {score.method && (
        <details className="mt-2">
          <summary className="mono cursor-pointer text-[10px] text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink-dim)]">
            how this is measured
          </summary>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[color:var(--color-ink-faint)]">{score.method}</p>
        </details>
      )}
      {bridge && (
        <p className="mt-2 text-[11px] leading-snug text-[color:var(--color-ink-faint)]">
          <span className="mono text-[color:var(--color-signal)]">{bridge.tier}</span> · {bridge.line}
        </p>
      )}
      <div className="mt-auto">
        <VerifyLine verify={score.verify} />
      </div>
    </div>
  );
}

export default function RuntimeScoreBoard({ score }: { score: RuntimeScore }) {
  return (
    <div>
      <HeroRing hero={score.hero} generatedAt={score.generated_at} />

      {/* 3 per row (P9); the grid shape never changes */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SCORE_ORDER.map(([id, title]) => (
          <ScoreCard key={id} id={id} title={title} score={score.scores[id]} />
        ))}
      </div>

      {/* the not-measured registry: rendered, not hidden (spec §1 registry rule) */}
      {score.not_measured_registry?.length > 0 && (
        <div className="lm-card mt-3 p-5">
          <p className="kicker">Not measured — and saying so</p>
          <ul className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {score.not_measured_registry.map((r) => (
              <li key={r.what} className="text-[12px] leading-snug text-[color:var(--color-ink-faint)]">
                <span className="text-[color:var(--color-ink-dim)]">{r.what}</span> — {r.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
