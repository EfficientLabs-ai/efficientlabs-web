"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { track } from "@/lib/analytics";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [authReady, setAuthReady] = useState(true);
  const isSignup = mode === "signup";

  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authReady?: boolean }) => setAuthReady(d.authReady !== false))
      .catch(() => setAuthReady(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authReady) return;
    if (isSignup) track("signup_submit", { method: "email" });
    setBusy(true); setMsg(null); setOk(false);
    const res = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => ({})) as { error?: string };
    setBusy(false);
    if (!res.ok) { setOk(false); setMsg(body.error || "Unable to sign in."); return; }
    setOk(true);
    setMsg(isSignup ? "Account created — taking you to your control plane…" : "Signed in — taking you to your control plane…");
    setTimeout(() => { window.location.href = "/app"; }, 600);
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center overflow-x-hidden px-6 py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-20 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full opacity-[0.14] blur-[120px]"
             style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
      </div>

      <div className="relative">
        <Link href="/" className="mb-8 inline-flex"><Wordmark size={16} tracking="0.16em" /></Link>
        <h1 className="display text-[clamp(1.8rem,4vw,2.4rem)] text-[color:var(--color-ink)]">
          {isSignup ? <>Create your <span className="aurora-text">sovereign</span> account.</> : <>Welcome <span className="aurora-text">back</span>.</>}
        </h1>
        <p className="mt-3 text-[14px] text-[color:var(--color-ink-dim)]">
          {isSignup ? "One account for the Atmosphere, your mesh, and StratosAgent." : "Sign in to your Atmosphere control plane."}
        </p>

        {!authReady && (
          <div className="mt-6 rounded-xl border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.07] px-4 py-3">
            <p className="mono text-[12px] text-[color:var(--color-signal)]">EARLY ACCESS</p>
            <p className="mt-1 text-[13px] text-[color:var(--color-ink-dim)]">
              Accounts open at launch. <a className="text-[color:var(--color-ink)] underline" href="mailto:hello@efficientlabs.ai?subject=Early%20access">Join the list →</a>
            </p>
          </div>
        )}

        {/* email */}
        <form onSubmit={submit} className="mt-7 space-y-3">
          <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="glass w-full rounded-xl px-4 py-3 text-[14px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-faint)]" />
          <input type="password" required minLength={12} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="glass w-full rounded-xl px-4 py-3 text-[14px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-faint)]" />
          <button type="submit" disabled={!authReady || busy} className="btn-signal w-full justify-center disabled:opacity-50">
            {isSignup ? "Create account" : "Sign in"}<span aria-hidden>→</span>
          </button>
        </form>

        {msg && (
          <div role="status" aria-live="polite"
            className="mt-4 rounded-xl border px-4 py-3 text-[13px]"
            style={ok
              ? { borderColor: "color-mix(in oklab, #3fd68f 40%, transparent)", color: "#3fd68f", background: "color-mix(in oklab, #3fd68f 8%, transparent)" }
              : { borderColor: "color-mix(in oklab, #ff6e6e 40%, transparent)", color: "#ff8a8a", background: "color-mix(in oklab, #ff6e6e 8%, transparent)" }}>
            {ok ? "✓ " : "✗ "}{msg}
          </div>
        )}

        <p className="mt-7 text-center text-[13px] text-[color:var(--color-ink-faint)]">
          {isSignup
            ? <>Already have an account? <Link href="/login" className="text-[color:var(--color-signal)]">Sign in</Link></>
            : <>New here? <Link href="/signup" className="text-[color:var(--color-signal)]">Create an account</Link></>}
        </p>
      </div>
    </div>
  );
}
