import updates from "@/data/updates.json";
import Link from "next/link";
import { LEVELS, type Level } from "@/lib/status";

const DOT: Record<Level, string> = {
  live: "var(--color-signal)", wired: "#86c5ff", config: "#ff9f6e", standalone: "#c9a24b", mock: "#5b6675",
};

type Entry = { date: string; title: string; kind?: string; level?: Level; layer?: string; body?: string };

export default function Updates() {
  const items = updates as Entry[];
  return (
    <section className="relative pt-36 pb-28">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-[26rem] w-[42rem] -translate-x-1/2 rounded-full opacity-[0.10] blur-[130px]"
             style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }} />
      </div>
      <div className="relative mx-auto max-w-3xl px-6">
        <p className="kicker">Updates</p>
        <h1 className="display mt-4 text-[clamp(2rem,5vw,3.2rem)] text-[color:var(--color-ink)]">
          What&apos;s <span className="aurora-text">shipped</span>.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">
          The moment a capability goes live, it lands here — and our list subscribers hear about it.
          Same honest standard as the <Link href="/#status" className="text-[color:var(--color-signal)]">status board</Link>:
          nothing here is aspirational.
        </p>

        <ol className="mt-12 border-l border-[color:var(--color-line)]">
          {items.map((e, i) => (
            <li key={i} className="relative pl-8 pb-10 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full"
                    style={{ background: e.level ? DOT[e.level] : "var(--color-signal)", boxShadow: `0 0 10px ${e.level ? DOT[e.level] : "var(--color-signal)"}` }} />
              <div className="flex flex-wrap items-center gap-3">
                <time className="mono text-[12px] text-[color:var(--color-ink-faint)]">{e.date}</time>
                {e.kind === "capability" && e.level && (
                  <span className="mono rounded-full border px-2 py-0.5 text-[10px]"
                        style={{ borderColor: `color-mix(in oklab, ${DOT[e.level]} 40%, transparent)`, color: DOT[e.level] }}>
                    {e.layer} · {LEVELS[e.level].label}
                  </span>
                )}
                {e.kind === "release" && (
                  <span className="mono rounded-full border border-[color:var(--color-line)] px-2 py-0.5 text-[10px] text-[color:var(--color-ink-faint)]">release</span>
                )}
              </div>
              <h3 className="display mt-2 text-[1.15rem] text-[color:var(--color-ink)]">{e.title}</h3>
              {e.body && <p className="mt-1.5 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">{e.body}</p>}
            </li>
          ))}
        </ol>

        <div className="mt-12 lm-card p-6">
          <p className="text-[14px] text-[color:var(--color-ink)]">Want the ship list in your inbox?</p>
          <p className="mt-1 text-[13px] text-[color:var(--color-ink-dim)]">Every Live flip, the moment it happens.</p>
          <a href="mailto:hello@efficientlabs.ai?subject=Subscribe%20to%20updates" className="btn-signal mt-4 inline-flex">Get notified<span aria-hidden>→</span></a>
        </div>
      </div>
    </section>
  );
}
