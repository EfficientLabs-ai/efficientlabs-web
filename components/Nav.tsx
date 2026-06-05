"use client";
import { useEffect, useState } from "react";
import Wordmark from "@/components/Wordmark";

const NAV = [
  ["The Atmosphere", "#atmosphere"],
  ["StratosAgent", "#stratos"],
  ["Architecture", "#architecture"],
  ["Status", "#status"],
  ["Install", "#install"],
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile sheet is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const opaque = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-out"
        style={{
          background: opaque ? "color-mix(in oklab, var(--color-void) 80%, transparent)" : "transparent",
          backdropFilter: opaque ? "blur(14px) saturate(140%)" : "blur(0px)",
          WebkitBackdropFilter: opaque ? "blur(14px) saturate(140%)" : "blur(0px)",
          borderBottom: opaque ? "1px solid var(--color-line)" : "1px solid transparent",
          boxShadow: opaque ? "0 1px 0 rgba(255,255,255,0.03), 0 12px 30px -24px rgba(0,0,0,0.9)" : "none",
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#" onClick={() => setOpen(false)} className="group flex items-center transition-transform hover:scale-[1.02]">
            <Wordmark size={17} tracking="0.16em" />
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV.map(([label, href]) => (
              <a key={label} href={href}
                 className="mono text-[13px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
                {label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <a href="/login" className="mono text-[13px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">Sign in</a>
            <a href="#install" className="btn-signal !px-4 !py-2 text-[13px]">Install now<span aria-hidden>→</span></a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-void-2)] md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="relative block h-[14px] w-[18px]">
              <span className="absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-all duration-300"
                    style={{ top: open ? "6px" : "0px", transform: open ? "rotate(45deg)" : "none" }} />
              <span className="absolute left-0 top-[6px] block h-[1.5px] w-full rounded-full bg-current transition-all duration-200"
                    style={{ opacity: open ? 0 : 1 }} />
              <span className="absolute left-0 block h-[1.5px] w-full rounded-full bg-current transition-all duration-300"
                    style={{ top: open ? "6px" : "12px", transform: open ? "rotate(-45deg)" : "none" }} />
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile dropdown sheet */}
      <div
        className="overflow-hidden transition-[max-height,opacity] duration-300 md:hidden"
        style={{
          maxHeight: open ? "420px" : "0px",
          opacity: open ? 1 : 0,
          background: "color-mix(in oklab, var(--color-void) 92%, transparent)",
          backdropFilter: "blur(18px)",
          borderBottom: open ? "1px solid var(--color-line)" : "1px solid transparent",
        }}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 pb-6 pt-2">
          {NAV.map(([label, href]) => (
            <a key={label} href={href} onClick={() => setOpen(false)}
               className="mono rounded-lg px-3 py-3 text-[15px] text-[color:var(--color-ink-dim)] transition-colors hover:bg-[color:var(--color-void-2)]/60 hover:text-[color:var(--color-ink)]">
              {label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-4">
            <a href="/login" onClick={() => setOpen(false)}
               className="mono rounded-lg px-3 py-2 text-[14px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
              Sign in
            </a>
            <a href="#install" onClick={() => setOpen(false)} className="btn-signal w-full justify-center !py-3 text-[14px]">
              Install now<span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
