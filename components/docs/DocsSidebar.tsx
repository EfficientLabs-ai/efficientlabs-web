"use client";
// DocsSidebar — grouped, collapsible nav + a search trigger button. Active link
// derives from the current pathname (left accent bar + tinted bg + brighter text).
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Search } from "lucide-react";
import { NAV, getArticle } from "@/data/docs";

function SearchTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="mono flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 px-3 py-2 text-[12px] text-[color:var(--color-ink-faint)] transition-colors hover:border-[color:var(--color-edge)] hover:text-[color:var(--color-ink-dim)]"
      aria-label="Search docs"
    >
      <span className="flex items-center gap-2">
        <Search size={14} aria-hidden />
        Search docs
      </span>
      <kbd className="mono rounded-[var(--radius-xs)] border border-[color:var(--color-line)] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
    </button>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // open every group by default; a group containing the active page stays open.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      {NAV.map((group) => {
        const isCollapsed = collapsed[group.label] ?? false;
        return (
          <div key={group.label}>
            <button
              type="button"
              onClick={() => setCollapsed((c) => ({ ...c, [group.label]: !isCollapsed }))}
              aria-expanded={!isCollapsed}
              className="mono flex w-full items-center justify-between py-1 text-[0.72rem] uppercase tracking-[0.22em] text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-ink-dim)]"
            >
              {group.label}
              <ChevronRight
                size={13}
                aria-hidden
                style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)", transition: "transform 0.18s ease" }}
              />
            </button>
            {!isCollapsed && (
              <ul className="mt-1.5 space-y-0.5">
                {group.slugs.map((slug) => {
                  const a = getArticle(slug);
                  if (!a) return null;
                  const href = `/docs/${slug}`;
                  const active = pathname === href;
                  return (
                    <li key={slug}>
                      <a
                        href={href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className="relative block rounded-[var(--radius-sm)] py-1.5 pl-3 pr-2 text-[13px] transition-colors"
                        style={{
                          color: active ? "var(--color-ink)" : "var(--color-ink-dim)",
                          background: active ? "color-mix(in oklab, var(--color-signal) 10%, transparent)" : "transparent",
                          boxShadow: active ? "inset 2px 0 0 var(--color-signal)" : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            e.currentTarget.style.color = "var(--color-ink)";
                            e.currentTarget.style.background = "color-mix(in oklab, var(--color-void-2) 60%, transparent)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            e.currentTarget.style.color = "var(--color-ink-dim)";
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        {a.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Desktop sticky aside. */
export default function DocsSidebar({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <aside
      className="hidden md:block"
      style={{ position: "sticky", top: "5rem", height: "calc(100dvh - 5rem)", overflowY: "auto" }}
      aria-label="Docs navigation"
    >
      <div className="py-6 pr-3">
        <SearchTrigger onOpen={onOpenSearch} />
        <div className="mt-6">
          <NavLinks />
        </div>
      </div>
    </aside>
  );
}

/** Drawer body, reused inside the mobile slide-in. */
export function DocsSidebarBody({
  onOpenSearch,
  onNavigate,
}: {
  onOpenSearch: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="p-5">
      <SearchTrigger onOpen={onOpenSearch} />
      <div className="mt-6">
        <NavLinks onNavigate={onNavigate} />
      </div>
    </div>
  );
}
