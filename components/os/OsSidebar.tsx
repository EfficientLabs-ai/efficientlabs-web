"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Wordmark from "@/components/Wordmark";
import { OS_NAV_GROUPS, isActiveModule } from "./modules";

/**
 * OsSidebar — the persistent left rail (desktop ≥ lg), also reused inside the
 * mobile drawer. Attio-style grouping: uppercase mono section labels over dense
 * 32px nav items. Active item = 2px --signal left rail + --void-2 fill + --ink
 * text; inactive --ink-dim, hover --ink. All colours are token-driven so the rail
 * adapts to the OS light/dark theme for free.
 */
export default function OsSidebar({
  email,
  signedIn,
  onNavigate,
}: {
  email: string | null;
  signedIn?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-3 py-5">
      <Link href="/" className="mb-7 px-2" onClick={onNavigate}>
        <Wordmark size={15} tracking="0.14em" />
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto pr-0.5">
        {OS_NAV_GROUPS.map((group, gi) => (
          <div key={group.label ?? `g${gi}`} className="space-y-0.5">
            {group.label && (
              <p className="mono px-2.5 pb-1.5 text-[10.5px] uppercase tracking-[0.18em] text-[color:var(--color-ink-faint)]">
                {group.label}
              </p>
            )}
            {group.items.map((m) => {
              const active = isActiveModule(pathname, m.href);
              return (
                <Link
                  key={m.href}
                  href={m.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-8 w-full items-center gap-2.5 rounded-lg pl-3 pr-2.5 text-[13px] transition-colors",
                    active
                      ? "bg-[color:var(--color-void-2)] font-medium text-[color:var(--color-ink)]"
                      : "os-nav-hover text-[color:var(--color-ink-dim)] hover:text-[color:var(--color-ink)]",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-[color:var(--color-signal)]"
                    />
                  )}
                  <m.icon
                    size={15}
                    className={active ? "text-[color:var(--color-signal)]" : ""}
                  />
                  {m.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-void-2)] p-3">
        <p className="mono truncate text-[12px] text-[color:var(--color-ink)]">
          {email ?? "Not signed in"}
        </p>
        <p className="mono mt-1 flex items-center gap-1.5 text-[10px] tracking-wider text-[color:var(--color-ink-faint)]">
          <span
            aria-hidden
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: signedIn ? "var(--color-quantum)" : "var(--color-ink-faint)" }}
          />
          {signedIn ? "SOVEREIGN · FREE" : "PREVIEW · SIGN IN"}
        </p>
      </div>
    </div>
  );
}
