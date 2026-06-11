"use client";
import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Site-wide Lenis smooth scroll. Mounted once in the root layout.
 * - prefers-reduced-motion users keep native scrolling (never initialized).
 * - anchors:true lets #section links glide instead of jump.
 * - autoRaf drives its own loop; no ScrollTrigger on the site yet, so no
 *   ticker bridging is needed (wire lenis.on('scroll', ScrollTrigger.update)
 *   if a scrubbed set-piece lands later).
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      duration: 1.1,
    });

    const stop = () => lenis.destroy();
    reduced.addEventListener("change", stop, { once: true });
    return () => {
      reduced.removeEventListener("change", stop);
      lenis.destroy();
    };
  }, []);

  return null;
}
