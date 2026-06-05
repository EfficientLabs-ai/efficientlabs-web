"use client";
// DocsShell — coordinates the ⌘K search overlay and the mobile drawer, and lays
// out the 3-column grid: sidebar · content · (TOC supplied per-page).
//   - desktop (lg+): sidebar + content + page-supplied TOC region
//   - tablet (md):   sidebar + content (TOC dropped at the page level)
//   - mobile (<md):  sticky MobileDocsBar + slide-in drawer; content full-width
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import DocsSidebar, { DocsSidebarBody } from "@/components/docs/DocsSidebar";
import DocsSearch from "@/components/docs/DocsSearch";

export default function DocsShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ⌘K / Ctrl-K opens search anywhere in the docs.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the drawer is open; Esc closes it.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    if (drawerOpen) window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <>
      {/* skip link */}
      <a
        href="#docs-content"
        className="mono sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-20 focus:z-[70] focus:rounded-[var(--radius-sm)] focus:border focus:border-[color:var(--color-signal)]/40 focus:bg-[color:var(--color-void-2)] focus:px-3 focus:py-2 focus:text-[13px] focus:text-[color:var(--color-ink)]"
      >
        Skip to content
      </a>

      {/* Mobile sticky bar (under the fixed Nav) */}
      <div
        className="sticky top-16 z-30 border-b border-[color:var(--color-line)] md:hidden"
        style={{ background: "color-mix(in oklab, var(--color-void) 88%, transparent)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open docs menu"
            aria-expanded={drawerOpen}
            className="mono inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 px-3 py-1.5 text-[12px] text-[color:var(--color-ink-dim)]"
          >
            <Menu size={15} aria-hidden /> Menu
          </button>
          <span className="mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-ink-faint)]">Docs</span>
        </div>
      </div>

      {/* 3-col grid; wider than the marketing container (docs want ~88rem) */}
      <div
        className="mx-auto w-full px-5 sm:px-6"
        style={{ maxWidth: "88rem" }}
      >
        <div className="grid grid-cols-1 gap-x-10 md:grid-cols-[15rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)_14rem]">
          <DocsSidebar onOpenSearch={() => setSearchOpen(true)} />
          {children}
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            className="fixed inset-0 z-[55] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              aria-hidden
              className="absolute inset-0 bg-[color:var(--color-void)]/70 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Docs navigation"
              className="absolute inset-y-0 left-0 w-[80%] max-w-[20rem] overflow-y-auto border-r border-[color:var(--color-line)]"
              style={{ background: "var(--color-void)" }}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <div className="flex items-center justify-between border-b border-[color:var(--color-line)] px-5 py-3">
                <span className="mono text-[12px] uppercase tracking-[0.2em] text-[color:var(--color-ink-faint)]">Docs</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close docs menu"
                  className="grid h-9 w-9 place-items-center rounded-[var(--radius-sm)] border border-[color:var(--color-line)] text-[color:var(--color-ink-dim)]"
                >
                  <X size={16} aria-hidden />
                </button>
              </div>
              <DocsSidebarBody
                onOpenSearch={() => { setDrawerOpen(false); setSearchOpen(true); }}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DocsSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
