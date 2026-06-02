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
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className="transition-all duration-500"
        style={{
          background: scrolled ? "color-mix(in oklab, var(--color-void) 78%, transparent)" : "transparent",
          backdropFilter: scrolled ? "blur(14px)" : "none",
          borderBottom: scrolled ? "1px solid var(--color-line)" : "1px solid transparent",
        }}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="#" className="group flex items-center transition-transform hover:scale-[1.02]">
            <Wordmark size={17} tracking="0.16em" />
          </a>
          <div className="hidden items-center gap-8 md:flex">
            {NAV.map(([label, href]) => (
              <a key={label} href={href}
                 className="mono text-[13px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)]">
                {label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="mono hidden text-[13px] text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-ink)] sm:block">Sign in</a>
            <a href="#install" className="btn-signal !px-4 !py-2 text-[13px]">Install now<span aria-hidden>→</span></a>
          </div>
        </nav>
      </div>
    </header>
  );
}
