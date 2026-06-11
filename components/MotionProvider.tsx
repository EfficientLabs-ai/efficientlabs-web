"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { setLenis } from "@/lib/lenis-store";
import { registerMotion } from "@/lib/motion";

// Lenis + GSAP are MARKETING-surface affordances. The OS (/app), ops,
// dashboard and docs are working surfaces with native scroll regions —
// nothing initializes on those route trees.
const EXCLUDED_PREFIXES = ["/app", "/ops", "/docs", "/dashboard"];

/**
 * The single RAF loop for the whole motion system (mounted once in the root
 * layout): Lenis drives scroll, GSAP's ticker drives Lenis, and ScrollTrigger
 * updates on Lenis scroll — the canonical bridge, so scrubbed and smoothed
 * motion can never fight.
 *
 * prefers-reduced-motion users get the base state: no Lenis, no triggers,
 * no registration at all.
 */
export default function MotionProvider() {
  const pathname = usePathname();
  const excluded = EXCLUDED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  useEffect(() => {
    if (excluded) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    registerMotion();
    const lenis = new Lenis({ autoRaf: false, anchors: true, duration: 1.1 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Split-line metrics depend on final fonts; the hero swaps 100vh→340vh
    // after mount — both invalidate trigger positions, so refresh on each.
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    let t: ReturnType<typeof setTimeout> | undefined;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(document.body);

    const teardown = () => {
      clearTimeout(t);
      ro.disconnect();
      gsap.ticker.remove(tick);
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
