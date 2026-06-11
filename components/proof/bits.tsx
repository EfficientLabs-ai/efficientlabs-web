"use client";
// Shared atoms for the operating-layer proof tiles. These render the TRUTH
// LABELS from data/public-status.json (MEASURED / estimated / not measured)
// and the per-tile freshness rule: staleness is shown, never hidden; a source
// older than 48h degrades its copy to "last verified <date>".
import { useSyncExternalStore } from "react";
import { ageHours, STALE_AFTER_HOURS, type TileLabel } from "@/lib/public-status";

// Verdict colors live in ./palette (server-safe module) — re-exported here for
// client-side consumers like ReceiptVerifyCard.
export { VERDICT, CHECK_DOT } from "@/components/proof/palette";

/** The truth label chip every tile carries. null = "not measured" (grey). */
export function LabelChip({ label }: { label: TileLabel }) {
  const text = label === "MEASURED" ? "MEASURED" : label === "ESTIMATED" ? "estimated" : "not measured";
  const color = label === "MEASURED" ? "var(--color-signal)" : label === "ESTIMATED" ? "#e8b34b" : "#5b6675";
  return (
    <span
      className="mono inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px]"
      style={{ borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, color }}
    >
      {text}
    </span>
  );
}

/**
 * Freshness line. SSR renders the absolute date; after mount it refines to a
 * relative age. Past 48h the copy DEGRADES to "last verified <date>" — the
 * tile stops sounding live because it is not.
 */
const subscribeNever = () => () => {};
let clientNow: number | null = null; // cached so the snapshot is referentially stable
const getClientNow = () => (clientNow ??= Date.now());
const getServerNow = () => null;
export function UpdatedAt({ updatedAt }: { updatedAt: string | null | undefined }) {
  // SSR snapshot is null (absolute date renders), the client snapshot is the
  // first-render clock (relative age renders) — no effect, no hydration mismatch.
  const now = useSyncExternalStore(subscribeNever, getClientNow, getServerNow);
  if (!updatedAt) return null;
  const date = updatedAt.slice(0, 10);
  const h = now === null ? null : ageHours(updatedAt, now);
  let text: string;
  if (h === null) text = `updated ${date}`;
  // A source stamp ahead of the page clock is clock skew, not freshness — say
  // the absolute date and claim nothing live.
  else if (h < -0.25) text = `source stamp ${date} (ahead of page clock)`;
  else if (h > STALE_AFTER_HOURS) text = `last verified ${date}`;
  else if (h < 1) text = "updated <1h ago";
  else if (h < 24) text = `updated ${Math.round(h)}h ago`;
  else text = `updated ${Math.round(h / 24)}d ago`;
  return <span className="mono text-[10px] text-[color:var(--color-ink-faint)]">{text}</span>;
}

/** "Verify this yourself" footer — every tile links its verifier. */
export function VerifyLine({ verify }: { verify?: string }) {
  if (!verify) return null;
  return (
    <p className="mono mt-3 border-t border-[color:var(--color-line)] pt-2 text-[10px] leading-relaxed text-[color:var(--color-ink-faint)]">
      verify: {verify}
    </p>
  );
}

/** The designed empty state: a null tile stays in the grid, greyed — absence is information. */
export function NotMeasuredCard({ title, reason }: { title: string; reason?: string }) {
  return (
    <div className="lm-card p-5 opacity-70">
      <div className="flex items-center justify-between gap-2">
        <span className="mono text-[12px] text-[color:var(--color-ink)]">{title}</span>
        <LabelChip label={null} />
      </div>
      <p className="mt-2 text-[12px] leading-snug text-[color:var(--color-ink-faint)]">
        {reason || "source unreachable — not measured"}
      </p>
    </div>
  );
}
