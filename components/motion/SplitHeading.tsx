"use client";
import { createElement, useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import {
  registerMotion,
  motionOK,
  EASE,
  DUR,
  STAGGER,
  INTRO_PLAY_EVENT,
} from "@/lib/motion";

/**
 * The award-grade headline: server-rendered text (the SEO / no-JS /
 * reduced-motion base) that splits into masked lines and rises in with the
 * house ease. `playOn="scroll"` fires once on viewport entry; `"intro"`
 * waits for the preloader's INTRO_PLAY_EVENT (hero handoff).
 */
export default function SplitHeading({
  as = "h2",
  children,
  className = "",
  tier = "secondary",
  stagger = STAGGER.lines,
  start = "top 80%",
  playOn = "scroll",
  id,
}: {
  as?: "h1" | "h2" | "h3" | "p" | "div";
  children: ReactNode;
  className?: string;
  tier?: "hero" | "secondary";
  stagger?: number;
  start?: string;
  playOn?: "scroll" | "intro";
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionOK()) return;
      registerMotion();

      let onIntro: (() => void) | undefined;
      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true, // re-splits on font load + resize, replays cleanly
        linesClass: "split-line",
        onSplit(self) {
          gsap.set(self.lines, { willChange: "transform" });
          const tween = gsap.from(self.lines, {
            yPercent: 110,
            duration: tier === "hero" ? DUR.hero : DUR.secondary,
            ease: EASE.out,
            stagger,
            paused: playOn === "intro",
            scrollTrigger:
              playOn === "scroll"
                ? { trigger: el, start, once: true }
                : undefined,
            onComplete: () => gsap.set(self.lines, { clearProps: "willChange" }),
          });
          if (playOn === "intro" && !onIntro) {
            onIntro = () => tween.play();
            window.addEventListener(INTRO_PLAY_EVENT, onIntro, { once: true });
          }
          return tween;
        },
      });

      return () => {
        if (onIntro) window.removeEventListener(INTRO_PLAY_EVENT, onIntro);
        split.revert();
      };
    },
    { scope: ref },
  );

  return createElement(as, { ref, id, className }, children);
}
