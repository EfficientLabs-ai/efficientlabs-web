"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * OS theme — LIGHT-FIRST. The Atmosphere OS (/app only) is a light console by
 * default; the marketing site stays dark by simply never opting in (it never
 * sets `data-theme`). The light/dark palettes live in app/globals.css as an
 * additive `[data-theme="light"]` block over the dark defaults, so the dark
 * tokens are untouched.
 *
 * Persistence: localStorage("os-theme"). Default "light" when unset.
 * The attribute is written to the OS root element (data-theme) by OsShell so the
 * override is scoped to the OS subtree, never the whole document.
 */
export type OsTheme = "light" | "dark";
export const OS_THEME_KEY = "os-theme";

export function readStoredTheme(): OsTheme {
  if (typeof window === "undefined") return "light";
  const v = window.localStorage.getItem(OS_THEME_KEY);
  return v === "dark" ? "dark" : "light"; // default light
}

type ThemeCtx = { theme: OsTheme; toggle: () => void; setTheme: (t: OsTheme) => void };
const OsThemeContext = createContext<ThemeCtx | null>(null);
export const OsThemeProvider = OsThemeContext.Provider;

export function useOsThemeState(): ThemeCtx {
  // Start at "light" on both server and first client render to avoid hydration
  // mismatch; reconcile with the stored value in an effect.
  const [theme, setThemeState] = useState<OsTheme>("light");

  useEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  const setTheme = useCallback((t: OsTheme) => {
    setThemeState(t);
    try {
      window.localStorage.setItem(OS_THEME_KEY, t);
    } catch {
      /* storage may be unavailable (private mode) — theme still applies for the session */
    }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: OsTheme = prev === "light" ? "dark" : "light";
      try {
        window.localStorage.setItem(OS_THEME_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return { theme, toggle, setTheme };
}

export function useOsTheme(): ThemeCtx {
  const ctx = useContext(OsThemeContext);
  if (!ctx) {
    // Safe fallback when rendered outside the shell (e.g. isolated tests).
    return { theme: "light", toggle: () => {}, setTheme: () => {} };
  }
  return ctx;
}
