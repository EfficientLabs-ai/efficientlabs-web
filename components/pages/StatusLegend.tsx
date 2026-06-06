import Link from "next/link";
import { LEVELS } from "@/lib/status";
import { LEVEL_DOT } from "@/components/pages/StatusBadge";
import { Reveal } from "@/components/Reveal";

const ORDER = ["live", "wired", "standalone", "mock"] as const;

/**
 * Inline honesty legend the deep pages drop near their feature grids. It teaches
 * the four status levels straight from data/status.json so a reader always knows
 * exactly what a badge means — and links to the full /status matrix.
 */
export default function StatusLegend() {
  return (
    <Reveal>
      <div className="data-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mono text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
            How we label every capability
          </p>
          <Link
            href="/status"
            className="mono text-[11px] text-[color:var(--color-signal)] transition-colors hover:text-[color:var(--color-quantum)]"
          >
            Full status matrix →
          </Link>
        </div>
        <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ORDER.map((lv) => (
            <div key={lv} className="flex flex-col gap-1.5">
              <dt className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: LEVEL_DOT[lv] }} />
                <span className="mono text-[12px]" style={{ color: LEVEL_DOT[lv] }}>{LEVELS[lv].label}</span>
              </dt>
              <dd className="text-[12px] leading-snug text-[color:var(--color-ink-faint)]">{LEVELS[lv].blurb}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Reveal>
  );
}
