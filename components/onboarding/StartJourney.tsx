"use client";
// The segmentation question + GET RUNNING checklist — terminal idiom, no
// wizard, no overlay. Segmentation changes FRAMING ONLY; the five steps are
// identical for every answer (binding spec rule). Selection persists locally
// until the onboarding state API lands; completion is quiet by design.
import { useSyncExternalStore } from "react";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import { CHECKLIST, SEGMENTS, type SegmentId } from "@/lib/onboarding";

// Selection lives in localStorage (until the onboarding state API lands) and
// is read via useSyncExternalStore — SSR renders the unselected state, the
// client snapshot is the saved choice; no effect, no hydration mismatch.
const LS_KEY = "efl-onboarding-segment";
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const readSegment = (): SegmentId | null => {
  try {
    const v = localStorage.getItem(LS_KEY) as SegmentId | null;
    return v && SEGMENTS.some((s) => s.id === v) ? v : null;
  } catch { return null; }
};
const writeSegment = (id: SegmentId) => {
  try { localStorage.setItem(LS_KEY, id); } catch { /* private mode — selection just doesn't persist */ }
  listeners.forEach((l) => l());
};

export default function StartJourney() {
  const segment = useSyncExternalStore(subscribe, readSegment, () => null);
  const pick = writeSegment;
  const active = SEGMENTS.find((s) => s.id === segment) || null;

  return (
    <div>
      {/* ── one question, three answers, no follow-ups ── */}
      <div className="lm-card p-6" id="segment">
        <p className="kicker">One question</p>
        <h3 className="mt-2 text-[17px] text-[color:var(--color-ink)]">What are you setting up?</h3>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {SEGMENTS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => pick(s.id)}
              aria-pressed={segment === s.id}
              className={
                "mono flex-1 rounded-[var(--radius-sm)] border px-4 py-3 text-left text-[13px] transition-colors " +
                (segment === s.id
                  ? "border-[color:var(--color-signal)] text-[color:var(--color-ink)]"
                  : "border-[color:var(--color-line)] text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)]")
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        {active && (
          <p className="mt-3 text-[12.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
            {active.framing}
          </p>
        )}
      </div>

      {/* ── GET RUNNING — the checklist, terminal idiom (P14/P15) ── */}
      <div className="lm-card mt-3 p-6" id="checklist">
        <div className="flex items-center justify-between gap-3">
          <p className="kicker">Get running</p>
          <span className="mono text-[10px] text-[color:var(--color-ink-faint)]">
            steps 1–2 and 4–5 need no account
          </span>
        </div>
        <ol className="mt-4 space-y-3">
          {CHECKLIST.map((step) => (
            <li key={step.n} className="rounded-[var(--radius-sm)] border border-[color:var(--color-line)] p-3.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">{step.n}</span>
                <span className="mono text-[13px] text-[color:var(--color-ink)]">{step.title}</span>
                {!step.sovereign && (
                  <span className="mono rounded-full border border-[color:var(--color-line)] px-2 py-0.5 text-[10px] text-[color:var(--color-ink-faint)]">
                    the only account-bound step
                  </span>
                )}
                {step.n === 3 && segment === "team" && (
                  <span className="mono text-[10px] text-[color:var(--color-ink-faint)]">· invite teammates after this step</span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <code className="mono flex-1 overflow-x-auto rounded bg-[color:var(--color-void-2)]/60 px-3 py-2 text-[12.5px] text-[color:var(--color-ink)]">
                  $ {step.cmd}
                </code>
                <CopyButton text={step.cmd} />
              </div>
              <p className="mt-1.5 text-[11.5px] leading-snug text-[color:var(--color-ink-faint)]">{step.note}</p>
            </li>
          ))}
        </ol>
        {/* quiet completion — stated, never celebrated */}
        <p className="mono mt-4 border-t border-[color:var(--color-line)] pt-3 text-[11px] text-[color:var(--color-ink-faint)]">
          When step 5 passes: &ldquo;All steps done. Your chain verifies.&rdquo; Then your{" "}
          <Link href="/score" className="link-cta">Runtime Score</Link> shows its first measured values —
          the before/after is the whole point.
        </p>
        {segment === "enterprise" && (
          <p className="mono mt-2 text-[11px] text-[color:var(--color-ink-faint)]">
            fleet setup: same node first; <Link href="/docs" className="link-cta">fleet docs</Link> when you scale it out.
          </p>
        )}
      </div>
    </div>
  );
}
