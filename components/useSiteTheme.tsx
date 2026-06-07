"use client";
import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

/**
 * Site-wide theme — DEFAULT DARK (the cinematic brand). Unlike the OS theme
 * (which is scoped to #os-root), this writes `data-theme` to <html> so the WHOLE
 * marketing site (nav, sections, cards, footer, sub-pages) flips. The light
 * palette lives in app/globals.css as the additive `[data-theme="light"]` block
 * over the dark defaults; light is an opt-in toggle, never the default.
 *
 * Persistence: localStorage("efl-theme"). Default "dark" when unset.
 * A pre-paint inline <script> in app/layout.tsx sets the attribute before first
 * paint so there is no light→dark (or dark→light) flash on load.
 */
export type SiteTheme = "light" | "dark";
export const SITE_THEME_KEY = "efl-theme";

export function readStoredSiteTheme(): SiteTheme {
  if (typeof window === "undefined") return "dark";
  try {
    const v = window.localStorage.getItem(SITE_THEME_KEY);
    return v === "light" ? "light" : "dark"; // default dark
  } catch {
    return "dark";
  }
}

type ThemeCtx = {
  theme: SiteTheme;
  toggle: () => void;
  setTheme: (t: SiteTheme) => void;
};
const SiteThemeContext = createContext<ThemeCtx | null>(null);

function applyToHtml(t: SiteTheme) {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", t);
  }
}

/**
 * External store backing the theme. <html data-theme> is the single source of
 * truth at runtime (set pre-paint by the inline script in layout.tsx, then kept
 * in sync here). We read from it via useSyncExternalStore so React stays
 * consistent with the DOM without a setState-in-effect reconciliation.
 */
const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): SiteTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light"
    ? "light"
    : "dark";
}

function getServerSnapshot(): SiteTheme {
  return "dark"; // matches the SSR'd <html data-theme="dark">
}

function writeTheme(t: SiteTheme) {
  applyToHtml(t);
  try {
    window.localStorage.setItem(SITE_THEME_KEY, t);
  } catch {
    /* storage unavailable (private mode) — theme still applies this session */
  }
  listeners.forEach((cb) => cb());
}

/**
 * ThemeRoot — mount once in app/layout.tsx body. Reconciles <html data-theme>
 * with the persisted choice on mount (the inline pre-paint script normally has
 * already done this; this is a safety net) and provides the theme context.
 */
export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((t: SiteTheme) => writeTheme(t), []);
  const toggle = useCallback(() => {
    writeTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, []);

  return (
    <SiteThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </SiteThemeContext.Provider>
  );
}

export function useSiteTheme(): ThemeCtx {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    // Safe fallback when rendered outside ThemeRoot (e.g. isolated tests).
    return { theme: "dark", toggle: () => {}, setTheme: () => {} };
  }
  return ctx;
}
