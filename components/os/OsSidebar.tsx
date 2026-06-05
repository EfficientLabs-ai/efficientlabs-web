"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Wordmark from "@/components/Wordmark";
import { OS_MODULES, isActiveModule } from "./modules";

/**
 * OsSidebar — the persistent left rail (desktop ≥ lg). Mirrors the OpsDashboard
 * aside. Also reused inside the mobile drawer (compact=false there as well, but
 * the drawer wraps it in its own panel). Active item uses signal-tinted bg.
 */
export default function OsSidebar({
  email,
  onNavigate,
}: {
  email: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-4 py-6">
      <Link href="/" className="mb-9 px-2" onClick={onNavigate}>
        <Wordmark size={15} tracking="0.14em" />
      </Link>

      <nav className="space-y-1 overflow-y-auto">
        {OS_MODULES.map((m) => {
          const active = isActiveModule(pathname, m.href);
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] transition-colors",
                active
                  ? "bg-[color:var(--color-signal)]/12 text-[color:var(--color-signal)]"
                  : "text-[color:var(--color-ink-dim)] hover:bg-white/5 hover:text-[color:var(--color-ink)]",
              )}
            >
              <m.icon size={17} /> {m.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-[color:var(--color-line)] p-3">
        <p className="mono truncate text-[12px] text-[color:var(--color-ink)]">
          {email ?? "Not signed in"}
        </p>
        <p className="mono mt-1 text-[10px] tracking-wider text-[color:var(--color-ink-faint)]">
          SOVEREIGN · FREE
        </p>
      </div>
    </div>
  );
}
