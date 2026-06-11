"use client";
import { useEffect, useSyncExternalStore } from "react";
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

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function reducedSnapshot() {
  return window.matchMedia(REDUCED_QUERY).matches;
}

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
  // Live preference: flipping reduced-motion ON tears the system down (below);
  // flipping it back OFF re-runs the effect and re-initializes.
  const reduced = useSyncExternalStore(subscribeReduced, reducedSnapshot, () => true);

  useEffect(() => {
    if (excluded || reduced) return;

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

    return () => {
      // Kill every trigger and force its animation to the END state so
      // from-tweens never strand content hidden (reduced-motion flip or
      // route-exclusion crossing mid-session).
      ScrollTrigger.getAll().forEach((st) => {
        const anim = st.animation;
        st.kill();
        if (anim) anim.progress(1).kill();
      });
      clearTimeout(t);
      ro.disconnect();
      gsap.ticker.remove(tick);
      setLenis(null);
      lenis.destroy();
    };
  }, [excluded, reduced]);

  return null;
}
