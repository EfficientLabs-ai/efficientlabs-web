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
 *
 * The brand artwork (kit v2 loading screen) is progressive enhancement:
 * its src is only set once this visit is known to be pending (so non-intro
 * visitors never download it), and it fades in ONLY after decode — the
 * count/wipe never waits for the image. Type-only is the base state.
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
      let cancelled = false;
      let finishing = false; // wipe timeline started — a late decode() must not fade the art in

      // Brand art: kick off the fetch now (pending confirmed), reveal on decode.
      const art = root.querySelector<HTMLImageElement>(".efl-preloader-art img");
      const artSource = root.querySelector<HTMLSourceElement>(".efl-preloader-art source");
      const scrim = root.querySelector<HTMLElement>(".efl-preloader-scrim");
      if (art?.dataset.src) {
        if (artSource?.dataset.srcset) artSource.srcset = artSource.dataset.srcset;
        art.fetchPriority = "high";
        art.src = art.dataset.src;
        art
          .decode()
          .then(() => {
            if (cancelled || finishing) return;
            if (document.documentElement.getAttribute("data-intro") !== "pending") return;
            gsap.to([art, scrim].filter(Boolean), { opacity: 1, duration: 0.6, ease: EASE.out });
          })
          .catch(() => {
            /* image failed/slow — type-only preloader is the designed base */
          });
      }
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

      Promise.race([
        Promise.all([document.fonts.ready, heroReady, minPace]),
        hardCap,
      ]).then(() => {
        if (cancelled) return;
        finishing = true;
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
        // Unmount before the wipe finished (client nav away mid-count):
        // release the attribute or the CSS scroll lock stays on app-wide.
        if (document.documentElement.getAttribute("data-intro") === "pending") {
          document.documentElement.setAttribute("data-intro", "done");
          window.dispatchEvent(new CustomEvent(INTRO_PLAY_EVENT));
        }
        getLenis()?.start();
      };
    },
    { scope: ref },
  );

  return (
    <div id="efl-preloader" ref={ref} aria-hidden>
      <picture className="efl-preloader-art">
        <source type="image/avif" data-srcset="/img/brand-loading-astronaut.avif" />
        {/* src set at runtime only when the intro is pending — see effect */}
        <img alt="" draggable={false} data-src="/img/brand-loading-astronaut.webp" />
      </picture>
      <div className="efl-preloader-scrim" />
      <span className="relative z-[1] mono text-[11px] tracking-[0.34em] text-[color:var(--color-ink-faint)]">
        EFFICIENT&nbsp;LABS
      </span>
      <span
        ref={counterRef}
        className="relative z-[1] mono text-[2.6rem] leading-none text-[color:var(--color-ink)]"
      >
        000
      </span>
    </div>
  );
}
