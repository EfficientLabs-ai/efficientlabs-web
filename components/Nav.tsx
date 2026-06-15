"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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

  return (
    <header className="cinematic fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      {/* the floating translucent pill */}
      <div
        className={
          "nav-pill mx-auto flex max-w-7xl items-center justify-between gap-4 py-2 pl-4 pr-2 sm:pl-5 sm:pr-2.5 " +
          // The pill stays dark-glass in BOTH themes (header carries `cinematic`)
          // so the light glassy logo always reads; scroll just deepens it.
          (scrolled || open ? "is-scrolled" : "")
        }
      >
        <Link href="/" onClick={() => setOpen(false)} className="group flex shrink-0 items-center transition-transform hover:scale-[1.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-full.png" alt="Efficient Labs" width={1132} height={250} className="h-7 w-auto sm:h-[30px] [filter:brightness(1.15)_saturate(1.08)]" />
        </Link>

        {/* Desktop links */}
        <div className="hidden shrink-0 items-center gap-6 md:flex">
          {NAV.map(([label, href]) => (
            <Link key={label} href={href}
               className="mono whitespace-nowrap text-[12.5px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/app" className="mono whitespace-nowrap text-[12.5px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">Open OS</Link>
          <Link href="/login" className="mono whitespace-nowrap text-[12.5px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">Sign in</Link>
          <Link href="/install" className="btn-signal whitespace-nowrap !rounded-full !px-4 !py-2 text-[13px]">Install now<span aria-hidden>→</span></Link>
        </div>

        {/* Mobile: theme toggle next to the hamburger */}
        <div className="flex items-center gap-1.5 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--color-ink)] transition-colors hover:bg-[color:var(--color-void-2)]/40"
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
      </div>

      {/* Mobile sheet — a floating glass card under the pill. data-lenis-prevent
          keeps any scrolling inside the sheet native even mid-frame. */}
      <div
        data-lenis-prevent
        className="nav-sheet mx-auto mt-2 max-w-6xl overflow-hidden transition-[max-height,opacity] duration-300 md:hidden"
        style={{ maxHeight: open ? "440px" : "0px", opacity: open ? 1 : 0, borderWidth: open ? undefined : 0 }}
      >
        <div className="flex flex-col gap-1 px-3 pb-5 pt-3">
          {NAV.map(([label, href]) => (
            <Link key={label} href={href} onClick={() => setOpen(false)}
               className="mono rounded-xl px-3 py-3 text-[15px] text-[color:var(--color-ink-dim)] transition-colors hover:bg-[color:var(--color-void-2)]/60 hover:text-[color:var(--color-ink)]">
              {label}
            </Link>
          ))}
          <div className="mt-3 flex flex-col gap-3 border-t border-[color:var(--color-line)] pt-4">
            <Link href="/app" onClick={() => setOpen(false)}
               className="mono rounded-xl px-3 py-2 text-[14px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
              Open OS
            </Link>
            <Link href="/login" onClick={() => setOpen(false)}
               className="mono rounded-xl px-3 py-2 text-[14px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
              Sign in
            </Link>
            <Link href="/install" onClick={() => setOpen(false)} className="btn-signal w-full justify-center !rounded-full !py-3 text-[14px]">
              Install now<span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
