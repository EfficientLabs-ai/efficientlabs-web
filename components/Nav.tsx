"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import ThemeToggle from "@/components/ThemeToggle";
import { getLenis } from "@/lib/lenis-store";

const NAV = [
  ["The Atmosphere", "/atmosphere"],
  ["StratosAgent", "/stratos"],
  ["Architecture", "/architecture"],
  ["Pricing", "/pricing"],
  ["Docs", "/docs"],
  ["Status", "/status"],
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

  // Lock scroll while the mobile sheet is open — both the native overflow
  // lock AND the Lenis root smoother (which would otherwise keep consuming
  // wheel/touch input behind the sheet).
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, [open]);

  const opaque = scrolled || open;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={
          "transition-[background-color,backdrop-filter,border-color,box-shadow] duration-300 ease-out " +
          (opaque ? "glass-nav" : "")
        }
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" onClick={() => setOpen(false)} className="group flex items-center transition-transform hover:scale-[1.02]">
            <Wordmark size={17} tracking="0.16em" pulse />
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV.map(([label, href]) => (
              <Link key={label} href={href}
                 className="mono text-[13px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link href="/app" className="mono text-[13px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">Open OS</Link>
            <Link href="/login" className="mono text-[13px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">Sign in</Link>
            <Link href="/install" className="btn-signal !px-4 !py-2 text-[13px]">Install now<span aria-hidden>→</span></Link>
          </div>

          {/* Mobile: theme toggle right next to the hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/50 text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-void-2)]"
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
          </div>
        </nav>
      </div>

      {/* Mobile dropdown sheet — data-lenis-prevent keeps any scrolling inside
          the sheet native even if the root smoother is mid-frame. */}
      <div
        data-lenis-prevent
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
            <Link key={label} href={href} onClick={() => setOpen(false)}
               className="mono rounded-lg px-3 py-3 text-[15px] text-[color:var(--color-ink-dim)] transition-colors hover:bg-[color:var(--color-void-2)]/60 hover:text-[color:var(--color-ink)]">
              {label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-4">
            <Link href="/app" onClick={() => setOpen(false)}
               className="mono rounded-lg px-3 py-2 text-[14px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
              Open OS
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}
               className="mono rounded-lg px-3 py-2 text-[14px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
              Sign in
            </Link>
            <Link href="/install" onClick={() => setOpen(false)} className="btn-signal w-full justify-center !py-3 text-[14px]">
              Install now<span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
