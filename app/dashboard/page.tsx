"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, Boxes, TerminalSquare, KeyRound, MessageSquare, CreditCard, ArrowRight } from "lucide-react";
import { supabase, authReady } from "@/lib/supabase";
import Wordmark from "@/components/Wordmark";

const CARDS = [
  { icon: Cpu, title: "StratosAgent", body: "Your agent's live status, recent runs, and cost-approval queue.", stat: "—", hint: "offline" },
  { icon: Boxes, title: "Your mesh", body: "Nodes paired into your private P2P mesh, pooling compute.", stat: "0 / 2", hint: "free tier" },
  { icon: TerminalSquare, title: "Install", body: "Bring a new device online in two commands.", stat: "↗", hint: "quickstart", href: "/#install" },
  { icon: KeyRound, title: "BYOK keys", body: "Your model keys, sealed locally — never leave your machine.", stat: "—", hint: "add a key" },
  { icon: MessageSquare, title: "Channels", body: "Telegram, Discord, Slack, Matrix, Signal — one agent, every inbox.", stat: "5", hint: "available" },
  { icon: CreditCard, title: "Plan", body: "Sovereign (Free). Pool more devices on Pro.", stat: "Free", hint: "upgrade", href: "/pricing" },
];

export default function Dashboard() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getUser().then(({ data }) => { setEmail(data.user?.email ?? null); setReady(true); });
  }, []);

  const signedIn = Boolean(email);

  return (
    <main className="relative min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-[color:var(--color-line)] bg-[color:var(--color-void)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/"><Wordmark size={15} tracking="0.16em" /></Link>
          <div className="flex items-center gap-4">
            <span className="mono text-[12px] text-[color:var(--color-ink-faint)]">{signedIn ? email : "control plane"}</span>
            {signedIn
              ? <button onClick={() => supabase?.auth.signOut().then(() => location.reload())} className="btn-ghost !px-4 !py-2 text-[12px]">Sign out</button>
              : <Link href="/login" className="btn-signal !px-4 !py-2 text-[12px]">Sign in<span aria-hidden>→</span></Link>}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="kicker">Control plane</p>
        <h1 className="display mt-4 text-[clamp(1.8rem,4vw,2.8rem)] text-[color:var(--color-ink)]">
          {signedIn ? <>Your <span className="aurora-text">Atmosphere</span>.</> : <>Your sovereign <span className="aurora-text">control plane</span>.</>}
        </h1>
        {!signedIn && ready && (
          <p className="mt-3 max-w-xl text-[14px] text-[color:var(--color-ink-dim)]">
            {authReady
              ? <>Sign in to manage your nodes, agent, and keys. <Link href="/login" className="text-[color:var(--color-signal)]">Sign in →</Link></>
              : <>A preview of what lands at launch — manage your mesh, agent, keys and channels from one place.</>}
          </p>
        )}

        <div className={`mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${!signedIn ? "opacity-70" : ""}`}>
          {CARDS.map((c) => {
            const inner = (
              <div className={`lm-card group flex h-full flex-col p-6 ${c.href ? "is-interactive" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="glass grid h-10 w-10 place-items-center rounded-xl text-[color:var(--color-signal)]"><c.icon size={18} /></div>
                  <span className="display text-[1.4rem] text-[color:var(--color-ink)]">{c.stat}</span>
                </div>
                <h3 className="mt-4 text-[15px] font-semibold text-[color:var(--color-ink)]">{c.title}</h3>
                <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">{c.body}</p>
                <span className="mono mt-4 inline-flex items-center gap-1 text-[11px] text-[color:var(--color-ink-faint)] group-hover:text-[color:var(--color-signal)]">
                  {c.hint} {c.href && <ArrowRight size={12} className="transition-transform duration-150 ease-out group-hover:translate-x-[3px]" />}
                </span>
              </div>
            );
            return c.href ? <Link key={c.title} href={c.href}>{inner}</Link> : <div key={c.title}>{inner}</div>;
          })}
        </div>
      </div>
    </main>
  );
}
