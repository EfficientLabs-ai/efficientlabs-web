"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, DollarSign, Users, Boxes, Radio, Settings, ArrowUpRight, ArrowDownRight,
  TrendingUp, UserPlus, XCircle, Rocket, Building2,
} from "lucide-react";
import Wordmark from "@/components/Wordmark";

/* ──────────────────────────────────────────────────────────────────────────
   DEMO DATA — clearly labelled. Wire Stripe (revenue) + Supabase (users/nodes)
   to make it live; the shapes below are what the real adapters return.
   ────────────────────────────────────────────────────────────────────────── */
const MRR_SERIES = [180, 240, 290, 410, 520, 680, 910, 1240];      // last 8 months ($)
const SIGNUPS_SERIES = [3, 5, 4, 8, 6, 11, 9];                      // last 7 days
const PLAN_MIX = [
  { name: "Sovereign", n: 31, color: "#5a6576" },
  { name: "Pro", n: 11, color: "#0a84ff" },
  { name: "Team", n: 4, color: "#3d6cff" },
  { name: "Enterprise", n: 1, color: "#c9a24b" },
];
const KPIS = [
  { icon: DollarSign, label: "MRR", value: "$1,240", delta: "+18%", up: true, sub: "vs last month" },
  { icon: Users, label: "Active users", value: "47", delta: "+12", up: true, sub: "+12 this week" },
  { icon: Boxes, label: "Mesh nodes online", value: "9", delta: "+3", up: true, sub: "across 6 members" },
  { icon: Radio, label: "Churn", value: "2.1%", delta: "-0.4%", up: false, sub: "down, good" },
];
const ACTIVITY = [
  { icon: UserPlus, color: "#0a84ff", text: "New signup — Pro", who: "darnell@…", t: "2m" },
  { icon: Boxes, color: "#3d6cff", text: "Node paired to mesh", who: "workstation-01", t: "19m" },
  { icon: Rocket, color: "#0a84ff", text: "Shipped — Skill-seal verification → Live", who: "status feed", t: "1h" },
  { icon: Building2, color: "#c9a24b", text: "Enterprise inquiry", who: "regulated fintech", t: "3h" },
  { icon: UserPlus, color: "#0a84ff", text: "New signup — Sovereign", who: "ona@…", t: "5h" },
  { icon: XCircle, color: "#e0566a", text: "Churned — Pro", who: "kept free tier", t: "1d" },
];

const NAV = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: DollarSign, label: "Revenue" },
  { icon: Users, label: "Users" },
  { icon: Boxes, label: "Mesh" },
  { icon: Rocket, label: "Updates" },
  { icon: Settings, label: "Settings" },
];

function AreaChart({ data, color = "#0a84ff", id }: { data: number[]; color?: string; id: string }) {
  const w = 600, h = 180, pad = 12;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - pad - ((v - min) / range) * (h - pad * 2)]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3.5" fill={color} />
    </svg>
  );
}

function BarChart({ data, color = "#3d6cff" }: { data: number[]; color?: string }) {
  const w = 600, h = 180; const max = Math.max(...data) || 1; const bw = w / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-44 w-full" preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = (v / max) * (h - 16);
        return <rect key={i} x={i * bw + bw * 0.22} y={h - bh} width={bw * 0.56} height={bh} rx="3"
          fill={color} opacity={0.45 + 0.55 * (v / max)} />;
      })}
    </svg>
  );
}

export default function OpsDashboard() {
  const [range, setRange] = useState("30d");
  const totalUsers = PLAN_MIX.reduce((s, p) => s + p.n, 0);

  return (
    <div className="flex min-h-screen">
      {/* ── sidebar ── */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/40 px-4 py-6 lg:flex">
        <Link href="/" className="mb-9 px-2"><Wordmark size={15} tracking="0.14em" /></Link>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <button key={n.label}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors ${
                n.active ? "bg-[color:var(--color-signal)]/12 text-[color:var(--color-signal)]"
                : "text-[color:var(--color-ink-dim)] hover:bg-white/5 hover:text-[color:var(--color-ink)]"}`}>
              <n.icon size={17} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-[color:var(--color-line)] p-3">
          <p className="mono text-[10px] tracking-wider text-[color:var(--color-ink-faint)]">FOUNDER · NEO</p>
          <p className="mt-1 text-[12px] text-[color:var(--color-ink-dim)]">Efficiens Laboratorium Inc</p>
        </div>
      </aside>

      {/* ── main ── */}
      <main className="min-w-0 flex-1">
        {/* header */}
        <header className="sticky top-0 z-20 overflow-hidden border-b border-[color:var(--color-line)] bg-[color:var(--color-void)]/80 backdrop-blur">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.18]"
               style={{ backgroundImage: "url(/img/ops-backdrop.jpg)", backgroundSize: "cover", backgroundPosition: "right center",
                        maskImage: "linear-gradient(90deg, transparent, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)" }} />
          <div className="relative flex items-center justify-between px-6 py-4">
            <div>
              <p className="kicker">Founder ops</p>
              <h1 className="display mt-1 text-[clamp(1.4rem,3vw,1.9rem)] text-[color:var(--color-ink)]">
                Welcome back, <span className="aurora-text">Neo</span>.
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="mono rounded-full border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.08] px-2.5 py-1 text-[10px] tracking-wider text-[color:var(--color-signal)]">DEMO DATA</span>
              <div className="hidden items-center gap-1 rounded-lg border border-[color:var(--color-line)] p-0.5 sm:flex">
                {["7d", "30d", "12m"].map((r) => (
                  <button key={r} onClick={() => setRange(r)}
                    className={`mono rounded-md px-2.5 py-1 text-[11px] ${range === r ? "bg-[color:var(--color-signal)]/15 text-[color:var(--color-signal)]" : "text-[color:var(--color-ink-faint)] hover:text-[color:var(--color-ink-dim)]"}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 px-6 py-6 xl:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* KPI cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {KPIS.map((k) => (
                <div key={k.label} className="lm-card p-5">
                  <div className="flex items-center justify-between">
                    <div className="glass grid h-9 w-9 place-items-center rounded-lg text-[color:var(--color-signal)]"><k.icon size={16} /></div>
                    <span className={`mono inline-flex items-center gap-0.5 text-[12px] ${k.up ? "text-[color:var(--color-signal)]" : "text-[#e0566a]"}`}>
                      {k.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}{k.delta}
                    </span>
                  </div>
                  <div className="display mt-4 text-[1.9rem] text-[color:var(--color-ink)]">{k.value}</div>
                  <div className="mono mt-1 text-[11px] text-[color:var(--color-ink-faint)]">{k.label} · {k.sub}</div>
                </div>
              ))}
            </div>

            {/* charts */}
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="lm-card p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Recurring revenue</p>
                    <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">MRR · last 8 months</p></div>
                  <TrendingUp size={16} className="text-[color:var(--color-signal)]" />
                </div>
                <div className="mt-4"><AreaChart data={MRR_SERIES} id="mrr" /></div>
              </div>
              <div className="lm-card p-5">
                <div className="flex items-center justify-between">
                  <div><p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Signups</p>
                    <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">new accounts · last 7 days</p></div>
                  <UserPlus size={16} className="text-[color:var(--color-quantum)]" />
                </div>
                <div className="mt-4"><BarChart data={SIGNUPS_SERIES} /></div>
              </div>
            </div>

            {/* plan mix */}
            <div className="lm-card p-5">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Plan distribution</p>
                <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">{totalUsers} accounts</span>
              </div>
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
                {PLAN_MIX.map((p) => <div key={p.name} style={{ width: `${(p.n / totalUsers) * 100}%`, background: p.color }} />)}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PLAN_MIX.map((p) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                    <span className="text-[13px] text-[color:var(--color-ink-dim)]">{p.name}</span>
                    <span className="mono ml-auto text-[12px] text-[color:var(--color-ink)]">{p.n}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── activity rail ── */}
          <aside className="space-y-4">
            <div className="lm-card p-5">
              <p className="text-[14px] font-semibold text-[color:var(--color-ink)]">Recent activity</p>
              <ul className="mt-4 space-y-4">
                {ACTIVITY.map((a, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: `${a.color}1f`, color: a.color }}>
                      <a.icon size={14} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] leading-snug text-[color:var(--color-ink)]">{a.text}</p>
                      <p className="mono truncate text-[11px] text-[color:var(--color-ink-faint)]">{a.who} · {a.t}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lm-card p-5">
              <p className="text-[13px] font-semibold text-[color:var(--color-ink)]">Go live</p>
              <p className="mt-1.5 text-[12px] leading-relaxed text-[color:var(--color-ink-dim)]">
                Numbers are demo data. Wire Stripe (revenue) + Supabase (users/nodes) and this lights up with the real business.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
