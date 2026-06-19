"use client";
import { useEffect } from "react";

/**
 * Route-segment error boundary. Catches unhandled client errors in the page tree
 * so a single failing section (e.g. a WebGL/canvas crash) degrades to a calm
 * fallback instead of white-screening the whole route. Claim-disciplined copy.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Diagnostics only — message, never PII or secrets.
    console.error("[efl] route error:", error?.message);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 text-center">
      <div className="glass relative w-full max-w-md rounded-2xl p-8">
        <p className="mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-ink-faint)]">
          Something broke
        </p>
        <h1 className="display mt-3 text-[1.6rem] text-[color:var(--color-ink)]">
          This section hit an error.
        </h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
          Your work and your node are untouched — this is just the page. Try again, or head back home.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" onClick={() => reset()} className="btn-signal justify-center text-[13px]">
            Try again
          </button>
          <a href="/" className="btn-outline justify-center text-[13px]">
            Home
          </a>
        </div>
        {error?.digest && (
          <p className="mono mt-4 text-[10px] text-[color:var(--color-ink-faint)]">ref: {error.digest}</p>
        )}
      </div>
    </main>
  );
}
