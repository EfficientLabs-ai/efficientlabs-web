// The public status matrix reads from data/status.json — the single source of
// truth that `scripts/ship.mjs` edits when a capability goes Live. The honesty
// moat means this page never claims more than the running system actually does.
import data from "@/data/status.json";

export type Level = "live" | "wired" | "standalone" | "mock";
export type Capability = { name: string; detail: string; level: Level };
export type Layer = { id: string; name: string; caps: Capability[] };

export const LEVELS = data.levels as Record<Level, { label: string; blurb: string }>;
export const LAYERS = data.layers as Layer[];
