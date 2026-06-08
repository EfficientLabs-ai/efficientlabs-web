"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * useOsPrefs — the Atmosphere OS customization substrate.
 *
 * Owns everything the user can tune about the OS, ALL client-side and persisted
 * to localStorage. Nothing here fabricates or alters live data — it only governs
 * presentation (accent / density), which Home sections are shown and in what
 * order, and whether the deeper "Advanced" controls are revealed.
 *
 * Persistence: a single JSON blob under localStorage("os-prefs"). Reads degrade
 * gracefully (private mode / SSR) to DEFAULT_PREFS so the OS always renders.
 *
 * Application of accent + density is done WITHOUT touching globals.css: OsShell
 * writes the chosen accent into the existing `--color-signal` / `--color-signal-deep`
 * CSS variables and density into `--radius`* + a content scale, scoped to the OS
 * root element only (inline style on #os-root). Every surface already reads these
 * tokens, so the whole OS re-themes with no per-component changes.
 *
 * Companion to useOsTheme (light/dark), which is intentionally left untouched.
 */

export const OS_PREFS_KEY = "os-prefs";

// ── Accent ──────────────────────────────────────────────────────────────────
// Each accent maps to the two signal tokens the OS already paints from. The
// default ("azure") is byte-identical to the shipped --color-signal values, so
// an un-customized OS looks exactly as before.
export type OsAccent = "azure" | "cyan" | "violet";

export const ACCENTS: Record<
  OsAccent,
  { label: string; signal: string; signalDeep: string }
> = {
  azure: { label: "Azure", signal: "#2e8bff", signalDeep: "#1769db" },
  cyan: { label: "Cyan", signal: "#22b8d6", signalDeep: "#0e93b0" },
  violet: { label: "Violet", signal: "#7c6cff", signalDeep: "#5a47e6" },
};

// ── Density ─────────────────────────────────────────────────────────────────
export type OsDensity = "comfortable" | "compact";

// Density tunes the shared radius scale + a content scale variable the OS can
// opt into. Comfortable === the shipped defaults.
export const DENSITY: Record<
  OsDensity,
  { label: string; radius: string; radiusSm: string; radiusLg: string; scale: string }
> = {
  comfortable: { label: "Comfortable", radius: "8px", radiusSm: "6px", radiusLg: "10px", scale: "1" },
  compact: { label: "Compact", radius: "6px", radiusSm: "5px", radiusLg: "8px", scale: "0.92" },
};

// ── Dashboard sections ────────────────────────────────────────────────────────
// The Home overview is composed from these named sections. Users may hide and
// reorder them; the canonical order/labels live here so Home and the Customize
// panel never drift.
export type DashSectionId = "overview" | "system" | "modules" | "advanced";

export const DASH_SECTIONS: { id: DashSectionId; label: string; description: string }[] = [
  { id: "overview", label: "Overview", description: "Account metrics (honest — no fabricated figures)." },
  { id: "system", label: "System", description: "What is actually live now, status-driven." },
  { id: "modules", label: "Modules", description: "Quick links into every OS module." },
  { id: "advanced", label: "Advanced panel", description: "Deeper preview controls on Home (Advanced mode)." },
];

const ALL_SECTION_IDS = DASH_SECTIONS.map((s) => s.id);

// ── Prefs shape ───────────────────────────────────────────────────────────────
export type OsPrefs = {
  accent: OsAccent;
  density: OsDensity;
  advanced: boolean;
  /** Ordered list of section ids that are SHOWN on Home, in render order. */
  dashOrder: DashSectionId[];
  /** Section ids explicitly hidden (kept separate so new sections default-on). */
  dashHidden: DashSectionId[];
};

export const DEFAULT_PREFS: OsPrefs = {
  accent: "azure",
  density: "comfortable",
  advanced: false,
  // "advanced" panel is off the Home layout by default; it appears once the user
  // both enables Advanced mode AND keeps it in the shown list.
  dashOrder: ["overview", "system", "modules"],
  dashHidden: ["advanced"],
};

function sanitize(raw: unknown): OsPrefs {
  if (!raw || typeof raw !== "object") return DEFAULT_PREFS;
  const r = raw as Partial<OsPrefs>;
  const accent: OsAccent = r.accent && r.accent in ACCENTS ? r.accent : DEFAULT_PREFS.accent;
  const density: OsDensity =
    r.density && r.density in DENSITY ? r.density : DEFAULT_PREFS.density;
  const advanced = typeof r.advanced === "boolean" ? r.advanced : DEFAULT_PREFS.advanced;

  // Reconcile order/hidden against the canonical section list so a stale stored
  // value can never drop a real section or surface a removed one.
  const storedOrder = Array.isArray(r.dashOrder) ? r.dashOrder : [];
  const storedHidden = Array.isArray(r.dashHidden) ? r.dashHidden : [];
  const valid = (id: unknown): id is DashSectionId =>
    typeof id === "string" && (ALL_SECTION_IDS as string[]).includes(id);

  const hidden = storedHidden.filter(valid);
  const order = storedOrder.filter((id) => valid(id) && !hidden.includes(id));
  // Any known section that is neither ordered nor hidden defaults to shown,
  // appended at the end (keeps newly added sections visible by default).
  for (const id of ALL_SECTION_IDS) {
    if (!order.includes(id) && !hidden.includes(id)) order.push(id);
  }
  return { accent, density, advanced, dashOrder: order, dashHidden: hidden };
}

export function readStoredPrefs(): OsPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(OS_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return sanitize(JSON.parse(raw));
  } catch {
    return DEFAULT_PREFS;
  }
}

export type OsPrefsCtx = {
  prefs: OsPrefs;
  ready: boolean;
  setAccent: (a: OsAccent) => void;
  setDensity: (d: OsDensity) => void;
  setAdvanced: (v: boolean) => void;
  toggleAdvanced: () => void;
  /** Show or hide a Home section. */
  setSectionVisible: (id: DashSectionId, visible: boolean) => void;
  /** Move a shown section up/down within the shown order. */
  moveSection: (id: DashSectionId, dir: "up" | "down") => void;
  resetPrefs: () => void;
};

export function useOsPrefsState(): OsPrefsCtx {
  // Start from defaults on server + first client render to avoid hydration
  // mismatch, then reconcile with the stored value in an effect.
  const [prefs, setPrefs] = useState<OsPrefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPrefs(readStoredPrefs());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const persist = useCallback((next: OsPrefs) => {
    setPrefs(next);
    try {
      window.localStorage.setItem(OS_PREFS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — change still applies for the session */
    }
  }, []);

  const setAccent = useCallback(
    (accent: OsAccent) => persist({ ...readStoredPrefs(), accent }),
    [persist],
  );
  const setDensity = useCallback(
    (density: OsDensity) => persist({ ...readStoredPrefs(), density }),
    [persist],
  );
  const setAdvanced = useCallback(
    (advanced: boolean) => persist({ ...readStoredPrefs(), advanced }),
    [persist],
  );
  const toggleAdvanced = useCallback(() => {
    const cur = readStoredPrefs();
    persist({ ...cur, advanced: !cur.advanced });
  }, [persist]);

  const setSectionVisible = useCallback(
    (id: DashSectionId, visible: boolean) => {
      const cur = readStoredPrefs();
      if (visible) {
        if (cur.dashOrder.includes(id)) return;
        persist({
          ...cur,
          dashOrder: [...cur.dashOrder, id],
          dashHidden: cur.dashHidden.filter((x) => x !== id),
        });
      } else {
        if (cur.dashHidden.includes(id)) return;
        persist({
          ...cur,
          dashOrder: cur.dashOrder.filter((x) => x !== id),
          dashHidden: [...cur.dashHidden, id],
        });
      }
    },
    [persist],
  );

  const moveSection = useCallback(
    (id: DashSectionId, dir: "up" | "down") => {
      const cur = readStoredPrefs();
      const order = [...cur.dashOrder];
      const i = order.indexOf(id);
      if (i === -1) return;
      const j = dir === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= order.length) return;
      [order[i], order[j]] = [order[j], order[i]];
      persist({ ...cur, dashOrder: order });
    },
    [persist],
  );

  const resetPrefs = useCallback(() => persist(DEFAULT_PREFS), [persist]);

  return useMemo(
    () => ({
      prefs,
      ready,
      setAccent,
      setDensity,
      setAdvanced,
      toggleAdvanced,
      setSectionVisible,
      moveSection,
      resetPrefs,
    }),
    [
      prefs,
      ready,
      setAccent,
      setDensity,
      setAdvanced,
      toggleAdvanced,
      setSectionVisible,
      moveSection,
      resetPrefs,
    ],
  );
}

const OsPrefsContext = createContext<OsPrefsCtx | null>(null);
export const OsPrefsProvider = OsPrefsContext.Provider;

export function useOsPrefs(): OsPrefsCtx {
  const ctx = useContext(OsPrefsContext);
  if (!ctx) {
    // Safe no-op fallback when rendered outside the shell (isolated tests).
    return {
      prefs: DEFAULT_PREFS,
      ready: false,
      setAccent: () => {},
      setDensity: () => {},
      setAdvanced: () => {},
      toggleAdvanced: () => {},
      setSectionVisible: () => {},
      moveSection: () => {},
      resetPrefs: () => {},
    };
  }
  return ctx;
}

/**
 * Build the inline style object OsShell applies to #os-root. Overrides only the
 * accent + density tokens the OS already reads — never anything in globals.css.
 */
export function prefsStyle(prefs: OsPrefs): React.CSSProperties {
  const a = ACCENTS[prefs.accent];
  const d = DENSITY[prefs.density];
  return {
    // accent
    ["--color-signal" as string]: a.signal,
    ["--color-signal-deep" as string]: a.signalDeep,
    // density
    ["--radius" as string]: d.radius,
    ["--radius-sm" as string]: d.radiusSm,
    ["--radius-lg" as string]: d.radiusLg,
    ["--os-scale" as string]: d.scale,
  };
}

/** Derive whether a Home section should render, honoring Advanced gating. */
export function isSectionShown(prefs: OsPrefs, id: DashSectionId): boolean {
  if (!prefs.dashOrder.includes(id)) return false;
  // The "advanced" panel only renders when Advanced mode is also on.
  if (id === "advanced" && !prefs.advanced) return false;
  return true;
}
