"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { siGoogle, siApple, siGithub } from "simple-icons";
import { supabase, authReady } from "@/lib/supabase";
import Wordmark from "@/components/Wordmark";

type Provider = "google" | "github" | "azure" | "apple";

const SOCIALS: { id: Provider; label: string; brand?: { path: string } }[] = [
  { id: "google", label: "Google", brand: siGoogle },
  { id: "github", label: "GitHub", brand: siGithub },
  { id: "azure", label: "Microsoft" },
  { id: "apple", label: "Apple", brand: siApple },
];

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
      <rect x="1" y="1" width="10" height="10" fill="#F25022" />
      <rect x="13" y="1" width="10" height="10" fill="#7FBA00" />
      <rect x="1" y="13" width="10" height="10" fill="#00A4EF" />
      <rect x="13" y="13" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  // Only show the social buttons for providers Supabase actually has enabled —
  // fetched live from GoTrue's /settings, so a provider appears the instant it's
  // configured in the dashboard (and we never show a button that would error).
  const [enabled, setEnabled] = useState<Provider[]>([]);
  const isSignup = mode === "signup";

  useEffect(() => {
    if (!authReady) return;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!d?.external) return;
        setEnabled(SOCIALS.filter((s) => d.external[s.id]).map((s) => s.id));
      })
      .catch(() => {});
  }, []);

  const socials = SOCIALS.filter((s) => enabled.includes(s.id));

  const oauth = async (provider: Provider) => {
    if (!supabase) return;
    setBusy(true);
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true); setMsg(null); setOk(false);
    const fn = isSignup
      ? supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
      : supabase.auth.signInWithPassword({ email, password });
    const { error } = await fn;
    setBusy(false);
    if (error) { setOk(false); setMsg(error.message); return; }
    setOk(true);
    setMsg(isSignup ? "Check your inbox to confirm your account." : "Signed in — taking you to your control plane…");
    // A successful sign-in lands the user in the app; signup waits for email confirmation.
    if (!isSignup) setTimeout(() => { window.location.href = "/dashboard"; }, 600);
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

        {/* social — only the providers Supabase has enabled (no broken buttons) */}
        {socials.length > 0 && (
          <>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {socials.map((s) => (
                <button key={s.id} onClick={() => oauth(s.id)} disabled={!authReady || busy}
                  className="lm-card flex items-center justify-center gap-2.5 px-4 py-3 text-[13px] text-[color:var(--color-ink)] transition-opacity disabled:opacity-50">
                  {s.brand
                    ? <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden><path d={s.brand.path} /></svg>
                    : <MicrosoftMark />}
                  {s.label}
                </button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-[color:var(--color-line)]" />
              <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">or email</span>
              <span className="h-px flex-1 bg-[color:var(--color-line)]" />
            </div>
          </>
        )}

        {/* email */}
        <form onSubmit={submit} className="space-y-3">
          <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="glass w-full rounded-xl px-4 py-3 text-[14px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-faint)]" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
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
