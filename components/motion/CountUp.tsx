"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { registerMotion, motionOK, EASE, DUR } from "@/lib/motion";

/**
 * Measured-number count-up. Server-renders the FINAL value (the SEO / no-JS /
 * reduced-motion truth — never a fake zero), then tweens textContent from 0
 * when the number enters the viewport. Layout-safe: only textContent changes.
 */
export default function CountUp({
  value,
  suffix = "",
  className = "",
  duration = DUR.hero,
}: {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const decimals = Number.isInteger(value) ? 0 : 1;
  const fmt = (n: number) => `${n.toFixed(decimals)}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !motionOK()) return;
      registerMotion();
      const state = { v: 0 };
      const tween = gsap.to(state, {
        v: value,
        duration,
        ease: EASE.out,
        snap: decimals === 0 ? { v: 1 } : undefined,
        onStart: () => {
          el.textContent = fmt(0);
        },
        onUpdate: () => {
          el.textContent = fmt(state.v);
        },
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        el.textContent = fmt(value);
      };
    },
    { dependencies: [value, suffix], scope: ref },
  );

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
