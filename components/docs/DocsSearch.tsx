"use client";
// DocsSearch — ⌘K command palette. Client-side filter over the flat docs index.
// Keyboard: ⌘K/Ctrl-K open, Esc close, ↑↓ navigate, Enter go. No search dep.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { SEARCH_INDEX, type SearchEntry } from "@/data/docs";

function score(entry: SearchEntry, q: string): number {
  const hay = `${entry.title} ${entry.group} ${entry.description} ${entry.keywords.join(" ")}`.toLowerCase();
  if (!hay.includes(q)) return 0;
  let s = 1;
  if (entry.title.toLowerCase().includes(q)) s += 5;
  if (entry.title.toLowerCase().startsWith(q)) s += 3;
  if (entry.group.toLowerCase().includes(q)) s += 1;
  return s;
}

export default function DocsSearch({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return SEARCH_INDEX.slice(0, 6);
    return SEARCH_INDEX
      .map((e) => ({ e, s: score(e, query) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.e)
      .slice(0, 8);
  }, [q]);

  // Side-effects only (no setState): focus the input and lock body scroll.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, [open]);

  const reset = useCallback(() => {
    setQ("");
    setSel(0);
  }, []);

  const close = useCallback(() => {
    reset();
    onClose();
  }, [reset, onClose]);

  const go = useCallback(
    (slug: string) => {
      close();
      router.push(`/docs/${slug}`);
    },
    [close, router]
  );

  // typing both filters and moves selection back to the top
  const onQuery = useCallback((value: string) => {
    setQ(value);
    setSel(0);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (results[sel]) go(results[sel].slug); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={close}
        >
          <div aria-hidden className="absolute inset-0 bg-[color:var(--color-void)]/70 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search docs"
            className="lm-card relative z-10 w-full max-w-[40rem] overflow-hidden"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={onKey}
          >
            <div className="flex items-center gap-3 border-b border-[color:var(--color-line)] px-4 py-3">
              <Search size={17} aria-hidden className="text-[color:var(--color-ink-faint)]" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => onQuery(e.target.value)}
                placeholder="Search docs…"
                className="w-full bg-transparent text-[15px] text-[color:var(--color-ink)] outline-none placeholder:text-[color:var(--color-ink-faint)]"
                aria-label="Search docs"
                role="combobox"
                aria-expanded="true"
                aria-controls="docs-search-results"
              />
              <kbd className="mono rounded-[var(--radius-xs)] border border-[color:var(--color-line)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-ink-faint)]">Esc</kbd>
            </div>

            <ul id="docs-search-results" role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-[13.5px] text-[color:var(--color-ink-faint)]">
                  No results for “{q}”.
                </li>
              )}
              {results.map((r, i) => (
                <li key={r.slug} role="option" aria-selected={i === sel}>
                  <button
                    type="button"
                    onMouseEnter={() => setSel(i)}
                    onClick={() => go(r.slug)}
                    className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 text-left transition-colors"
                    style={{
                      background: i === sel ? "color-mix(in oklab, var(--color-signal) 10%, transparent)" : "transparent",
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] text-[color:var(--color-ink)]">{r.title}</span>
                      <span className="mono block truncate text-[11px] text-[color:var(--color-ink-faint)]">{r.group}</span>
                    </span>
                    {i === sel && <CornerDownLeft size={14} aria-hidden className="shrink-0 text-[color:var(--color-signal)]" />}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
