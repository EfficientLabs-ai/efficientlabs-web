"use client";
import Link from "next/link";
import { Menu } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Wordmark from "@/components/Wordmark";

/**
 * OsTopBar — sticky top bar. Mirrors the /dashboard header.
 * Left: mobile hamburger + mobile-only Wordmark (desktop carries it in sidebar).
 * Right: contribution/wallet status chip → /app/wallet, then account control.
 *
 * The contribution chip is deliberately worded with NO figures:
 *   signed-out → "Preview"
 *   signed-in  → "Tracking · Payouts off" (compact form of the canonical
 *                "Contribution tracking active · Payouts not live").
 */
export default function OsTopBar({
  email,
  signedIn,
  onOpenDrawer,
}: {
  email: string | null;
  signedIn: boolean;
  onOpenDrawer: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-line)] bg-[color:var(--color-void)]/80 backdrop-blur">
      <div className="flex items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onOpenDrawer}
            aria-label="Open navigation"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[color:var(--color-line)] text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)] lg:hidden"
          >
            <Menu size={18} />
          </button>
          <Link href="/" className="min-w-0 truncate lg:hidden">
            <Wordmark size={14} tracking="0.14em" />
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/app/wallet"
            title={
              signedIn
                ? "Contribution tracking active · Payouts not live"
                : "Preview — sign in to track contribution"
            }
            className="mono hidden items-center gap-1.5 rounded-full border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/60 px-3 py-1.5 text-[11px] text-[color:var(--color-ink-dim)] hover:border-[color:var(--color-signal)]/30 hover:text-[color:var(--color-ink)] sm:inline-flex"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: signedIn ? "var(--color-quantum)" : "var(--color-ink-faint)" }}
            />
            {signedIn ? "Tracking · Payouts off" : "Preview"}
          </Link>

          {signedIn ? (
            <>
              <span className="mono hidden text-[12px] text-[color:var(--color-ink-faint)] sm:inline">
                {email}
              </span>
              <button
                onClick={() => supabase?.auth.signOut().then(() => location.reload())}
                className="btn-outline !px-4 !py-2 text-[12px]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-signal !px-4 !py-2 text-[12px]">
              Sign in
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
