import { LEVELS, LAYERS, type Level } from "@/lib/status";

/**
 * Honest status badge — the single visual primitive the sub-pages use to label
 * any capability. It reads its colour + label from the SAME tokens the homepage
 * StatusMatrix uses, so a page can NEVER drift from data/status.json and claim a
 * Mock/Wired thing is Live.
 */
export const LEVEL_DOT: Record<Level, string> = {
  live: "var(--color-signal)",
  wired: "#86c5ff",
  config: "#ff9f6e",
  standalone: "#c9a24b",
  mock: "#5b6675",
};

/**
 * Resolve the real, current level for a capability by exact name match against
 * data/status.json. Returns undefined if the name isn't tracked — callers must
 * pass a level explicitly in that case rather than guessing "live".
 */
export function levelForCap(name: string): Level | undefined {
  for (const layer of LAYERS) {
    const hit = layer.caps.find((c) => c.name === name);
    if (hit) return hit.level;
  }
  return undefined;
}

export default function StatusBadge({
  level,
  title,
}: {
  level: Level;
  /** Optional tooltip — defaults to the canonical blurb for the level. */
  title?: string;
}) {
  const color = LEVEL_DOT[level];
  return (
    <span
      title={title ?? LEVELS[level].blurb}
      className="mono inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]"
      style={{ borderColor: `color-mix(in oklab, ${color} 40%, transparent)`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {LEVELS[level].label}
    </span>
  );
}
