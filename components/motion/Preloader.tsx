"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getLenis } from "@/lib/lenis-store";
import {
  registerMotion,
  EASE,
  HERO_READY_EVENT,
  INTRO_PLAY_EVENT,
} from "@/lib/motion";

/**
 * Act zero — the counting preloader (homepage only, once per session).
 *
 * Visibility is decided BEFORE first paint by an inline script (see
 * app/page.tsx) that sets <html data-intro="pending"> only when the session
 * hasn't seen it, motion is allowed, and JS is running — so no-JS and
 * reduced-motion visitors never see this element at all (CSS shows it only
 * under [data-intro="pending"]).
 *
 * The counter paces 000→100 gated on real readiness (fonts + the hero's
 * first frame) with a 2.5s hard cap and a 1.2s minimum, then the SAME
 * timeline wipes the overlay and fires the hero intro.
 */
export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      const counterEl = counterRef.current;
      if (!root || !counterEl) return;
      if (document.documentElement.getAttribute("data-intro") !== "pending") return;

      registerMotion();
      // Background scroll is locked by CSS ([data-intro="pending"] →
      // overflow:hidden) — that holds even though Lenis initializes later
      // (MotionProvider's useEffect runs after this layout effect). The
      // lenis stop is belt-and-braces for re-entry cases only.
      getLenis()?.stop();
      window.scrollTo(0, 0);

      const counter = { v: 0 };
      const print = () => {
        counterEl.textContent = String(Math.round(counter.v)).padStart(3, "0");
      };

      // Drift toward 96 while we wait — never "done" before the page is.
      const drift = gsap.to(counter, {
        v: 96,
        duration: 2.4,
        ease: "power1.out",
        snap: { v: 1 },
        onUpdate: print,
      });

      const heroReady = new Promise<void>((resolve) => {
        window.addEventListener(HERO_READY_EVENT, () => resolve(), { once: true });
      });
      const minPace = new Promise((r) => setTimeout(r, 1200));
      const hardCap = new Promise((r) => setTimeout(r, 2500));
      let cancelled = false;

      Promise.race([
        Promise.all([document.fonts.ready, heroReady, minPace]),
        hardCap,
      ]).then(() => {
        if (cancelled) return;
        drift.kill();
        const tl = gsap.timeline();
        tl.to(counter, { v: 100, duration: 0.25, ease: "none", snap: { v: 1 }, onUpdate: print });
        tl.to(root, {
          yPercent: -100,
          duration: 0.45,
          ease: EASE.in,
          onStart: () => {
            getLenis()?.start();
            window.dispatchEvent(new CustomEvent(INTRO_PLAY_EVENT));
          },
        });
        tl.call(() => {
          document.documentElement.setAttribute("data-intro", "done");
          try {
            sessionStorage.setItem("efl-intro-seen", "1");
          } catch {
            /* private mode — the pre-paint script degrades the same way */
          }
        });
      });

      return () => {
        cancelled = true;
        drift.kill();
        getLenis()?.start();
      };
    },
    { scope: ref },
  );

  return (
    <div id="efl-preloader" ref={ref} aria-hidden>
      <span className="mono text-[11px] tracking-[0.34em] text-[color:var(--color-ink-faint)]">
        EFFICIENT&nbsp;LABS
      </span>
      <span
        ref={counterRef}
        className="mono text-[2.6rem] leading-none text-[color:var(--color-ink)]"
      >
        000
      </span>
    </div>
  );
}
