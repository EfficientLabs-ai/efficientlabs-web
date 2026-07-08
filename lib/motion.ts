import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

/**
 * THE WRITTEN MOTION SYSTEM — single source of truth for every animated
 * surface on the marketing site. One ease family, three duration tiers,
 * fixed staggers. Triggered motion uses the trio; scrubbed motion is always
 * ease:"none" (scroll is the ease). Nothing on the site may deviate.
 */

// The house curve as a cubic-bezier so motion/react and GSAP share it exactly.
export const EASE_CSS = [0.16, 1, 0.3, 1] as const;

// CustomEase ids (created in registerMotion).
export const EASE = {
  out: "efl-out", // entrances — fast attack, long settle
  in: "efl-in", // exits — ~20% faster
  inOut: "efl-inOut", // state changes (menus, transitions)
} as const;

// Three tiers, never a continuum.
export const DUR = { hero: 1.0, secondary: 0.5, micro: 0.1 } as const;

export const STAGGER = { lines: 0.045, chars: 0.03, cards: 0.1 } as const;

let registered = false;

/** Idempotent plugin + ease registration. Safe to call from any client module. */
export function registerMotion() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
  CustomEase.create(EASE.out, "0.16, 1, 0.3, 1");
  CustomEase.create(EASE.in, "0.7, 0, 0.84, 0");
  CustomEase.create(EASE.inOut, "0.83, 0, 0.17, 1");
  registered = true;
}

/** Reduced motion is the BASE state — when this is false, nothing initializes. */
export function motionOK(): boolean {
  return (
    typeof window !== "undefined" &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Fired by the homepage preloader when it hands off into the hero intro. */
export const INTRO_PLAY_EVENT = "efl:intro-play";
/** Fired once the hero's first frame is ready, to hand off from the preloader.
 *  Currently no hero dispatches it (the LiveDesk hero is DOM/video, not a WebGL
 *  scene), so the Preloader's hard-cap timeout drives the handoff; the hook stays
 *  for a future hero that wants to gate the reveal on its first paint. */
export const HERO_READY_EVENT = "efl:hero-ready";
