import type { Metadata } from "next";
import Wordmark from "@/components/Wordmark";

export const metadata: Metadata = {
  title: "Founder access — Efficient Labs",
  robots: { index: false, follow: false },
};

export default async function OpsLogin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full opacity-[0.12] blur-[120px]"
             style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
      </div>
      <form action="/api/ops-login" method="POST" className="glass relative w-full max-w-sm rounded-2xl p-7">
        <Wordmark size={15} tracking="0.16em" />
        <h1 className="display mt-6 text-[1.6rem] text-[color:var(--color-ink)]">Founder access</h1>
        <p className="mt-2 text-[13px] text-[color:var(--color-ink-dim)]">This area is private.</p>
        {e && <p className="mono mt-3 text-[12px] text-[#e0566a]">Incorrect password.</p>}
        <input type="password" name="password" required autoFocus placeholder="Password"
          className="mt-5 w-full rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/60 px-4 py-3 text-[14px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-faint)]" />
        <button type="submit" className="btn-signal mt-4 w-full justify-center">Enter<span aria-hidden>→</span></button>
      </form>
    </main>
  );
}
