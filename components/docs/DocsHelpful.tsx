"use client";
// DocsHelpful — "Was this page helpful?" + last-updated. Client state only, no backend.
import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function DocsHelpful({ updated }: { updated: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);

  const fmt = (iso: string) => {
    const d = new Date(iso + "T00:00:00");
    return Number.isNaN(d.getTime())
      ? iso
      : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[color:var(--color-line)] pt-6">
      <div className="flex items-center gap-3">
        {vote ? (
          <span className="text-[13.5px] text-[color:var(--color-ink-dim)]">Thanks for the feedback.</span>
        ) : (
          <>
            <span className="text-[13.5px] text-[color:var(--color-ink-dim)]">Was this page helpful?</span>
            <button
              type="button"
              aria-label="Yes, helpful"
              onClick={() => setVote("up")}
              className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-line)] text-[color:var(--color-ink-faint)] transition-colors hover:border-[color:var(--color-signal)]/40 hover:text-[color:var(--color-signal)]"
            >
              <ThumbsUp size={15} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="No, not helpful"
              onClick={() => setVote("down")}
              className="grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-line)] text-[color:var(--color-ink-faint)] transition-colors hover:border-[color:var(--color-edge)] hover:text-[color:var(--color-ink-dim)]"
            >
              <ThumbsDown size={15} aria-hidden />
            </button>
          </>
        )}
      </div>
      <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">Last updated {fmt(updated)}</span>
    </div>
  );
}
