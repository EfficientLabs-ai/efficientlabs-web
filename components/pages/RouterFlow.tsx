import { MessageSquare, Route, Cpu, Cloud, Lock } from "lucide-react";

/**
 * THE LOCAL-FIRST ROUTER — a signature diagram for /stratos. A prompt arrives,
 * the router resolves it LOCALLY by default (the path glows live), and the
 * frontier cloud is a clearly-marked opt-in branch (your key, cost-gated, never
 * the silent default). Server-rendered; CSS-only motion (.rflow-*), reduced
 * motion shows the lit static path. No live metrics — structure only.
 */
function Conn() {
  return <span className="rflow-sweep hidden h-[2px] w-10 shrink-0 rounded bg-[color:var(--color-edge)] lg:block" aria-hidden />;
}

export default function RouterFlow() {
  return (
    <div className="rflow flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
      {/* prompt */}
      <div className="glass flex items-center gap-3 rounded-[var(--radius)] px-5 py-4">
        <MessageSquare size={18} className="text-[color:var(--color-ink-dim)]" aria-hidden />
        <span className="text-[13px] font-medium text-[color:var(--color-ink)]">Prompt</span>
      </div>

      <Conn />

      {/* router */}
      <div
        className="flex items-center gap-3 rounded-[var(--radius)] px-5 py-4"
        style={{ background: "color-mix(in oklab, var(--color-signal) 10%, transparent)", border: "1px solid color-mix(in oklab, var(--color-signal) 38%, transparent)" }}
      >
        <Route size={18} className="text-[color:var(--color-signal)]" aria-hidden />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-[color:var(--color-ink)]">Router</p>
          <p className="mono text-[10px] tracking-[0.12em] text-[color:var(--color-signal)]">LOCAL-FIRST</p>
        </div>
      </div>

      <Conn />

      {/* outcomes */}
      <div className="flex flex-1 flex-col gap-3">
        {/* default: local */}
        <div
          className="flex items-center justify-between gap-3 rounded-[var(--radius)] px-5 py-4"
          style={{ background: "color-mix(in oklab, #3ddc97 9%, transparent)", border: "1px solid color-mix(in oklab, #3ddc97 36%, transparent)" }}
        >
          <span className="flex items-center gap-3">
            <Cpu size={18} style={{ color: "#3ddc97" }} aria-hidden />
            <span className="text-[13px] font-semibold text-[color:var(--color-ink)]">Local inference</span>
          </span>
          <span className="flex items-center gap-2.5">
            <span className="mono rounded-[var(--radius-pill)] px-2.5 py-0.5 text-[10px] tracking-[0.14em]" style={{ color: "#3ddc97", background: "color-mix(in oklab, #3ddc97 14%, transparent)" }}>DEFAULT</span>
            <span className="rflow-ping h-2.5 w-2.5 rounded-full" style={{ background: "#3ddc97", boxShadow: "0 0 10px 2px rgba(61,220,151,0.8)" }} aria-hidden />
          </span>
        </div>
        {/* opt-in: frontier cloud */}
        <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-dashed border-[color:var(--color-edge)] px-5 py-4 opacity-80">
          <span className="flex items-center gap-3">
            <Cloud size={18} className="text-[color:var(--color-ink-faint)]" aria-hidden />
            <span className="text-[13px] font-medium text-[color:var(--color-ink-dim)]">Frontier cloud</span>
          </span>
          <span className="mono inline-flex items-center gap-1.5 text-[10px] tracking-[0.12em] text-[color:var(--color-ink-faint)]">
            <Lock size={11} aria-hidden /> YOUR KEY · OPT-IN
          </span>
        </div>
      </div>
    </div>
  );
}
