"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis-store";

// Lenis is a MARKETING-surface affordance. The OS (/app), ops, dashboard and
// docs are working surfaces with their own native scroll regions (sidebars,
// search palettes, panes) — root smoothing would hijack them, so those route
// trees never initialize Lenis at all.
const EXCLUDED_PREFIXES = ["/app", "/ops", "/docs", "/dashboard"];

/**
 * Site-wide Lenis smooth scroll. Mounted once in the root layout.
 * - prefers-reduced-motion users keep native scrolling (never initialized).
 * - anchors:true lets #section links glide instead of jump.
 * - autoRaf drives its own loop; no ScrollTrigger on the site yet, so no
 *   ticker bridging is needed (wire lenis.on('scroll', ScrollTrigger.update)
 *   if a scrubbed set-piece lands later).
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const excluded = EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  useEffect(() => {
    if (excluded) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      duration: 1.1,
    });
    setLenis(lenis);

    const teardown = () => {
      setLenis(null);
      lenis.destroy();
    };
    reduced.addEventListener("change", teardown, { once: true });
    return () => {
      reduced.removeEventListener("change", teardown);
      teardown();
    };
  }, [excluded]);

  return null;
}
