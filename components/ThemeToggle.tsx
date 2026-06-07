"use client";
import { Moon, Sun } from "lucide-react";
import { useSiteTheme } from "./useSiteTheme";

/**
 * ThemeToggle — site-wide one-tap LIGHT ⇄ DARK switch for the marketing nav.
 * Light is the default; the icon shows the *current* mode (sun in light, moon
 * in dark) and the action flips to the other. Client state via useSiteTheme,
 * persisted to localStorage("efl-theme") and mirrored onto <html data-theme>.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useSiteTheme();
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      className={
        "grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[color:var(--color-line)] text-[color:var(--color-ink-dim)] transition-colors hover:border-[color:var(--color-signal)]/30 hover:text-[color:var(--color-ink)] " +
        className
      }
    >
      {isLight ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
