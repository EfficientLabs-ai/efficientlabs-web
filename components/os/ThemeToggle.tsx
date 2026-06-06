"use client";
import { Moon, Sun } from "lucide-react";
import { useOsTheme } from "./useOsTheme";

/**
 * ThemeToggle — one-tap LIGHT ⇄ DARK switch for the Atmosphere OS top bar.
 * Light is the default; the icon shows the *current* mode (sun in light, moon in
 * dark) and the action flips to the other. Pure client state via useOsTheme,
 * persisted to localStorage by the provider.
 */
export default function ThemeToggle() {
  const { theme, toggle } = useOsTheme();
  const isLight = theme === "light";
  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[color:var(--color-line)] text-[color:var(--color-ink-dim)] transition-colors hover:border-[color:var(--color-signal)]/30 hover:text-[color:var(--color-ink)]"
    >
      {isLight ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
