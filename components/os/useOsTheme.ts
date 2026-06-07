"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * OS theme — DARK-FIRST (consistent with the marketing site default). The
 * Atmosphere OS (/app only) is a dark console by default; light is an opt-in
 * toggle. The light palette lives in app/globals.css as an additive
 * `[data-theme="light"]` block over the dark defaults, so the dark tokens are
 * untouched.
 *
 * Persistence: localStorage("os-theme"). Default "dark" when unset.
 * The attribute is written to the OS root element (data-theme) by OsShell so the
 * override is scoped to the OS subtree, never the whole document.
 */
export type OsTheme = "light" | "dark";
export const OS_THEME_KEY = "os-theme";

export function readStoredTheme(): OsTheme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(OS_THEME_KEY);
  return v === "light" ? "light" : "dark"; // default dark
}

type ThemeCtx = { theme: OsTheme; toggle: () => void; setTheme: (t: OsTheme) => void };
const OsThemeContext = createContext<ThemeCtx | null>(null);
export const OsThemeProvider = OsThemeContext.Provider;

export function useOsThemeState(): ThemeCtx {
  // Start at "dark" on both server and first client render to avoid hydration
  // mismatch; reconcile with the stored value in an effect.
  const [theme, setThemeState] = useState<OsTheme>("dark");

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
      const next: OsTheme = prev === "dark" ? "light" : "dark";
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
    return { theme: "dark", toggle: () => {}, setTheme: () => {} };
  }
  return ctx;
}
