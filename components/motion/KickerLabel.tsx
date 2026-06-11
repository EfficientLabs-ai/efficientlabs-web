"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { registerMotion, motionOK, STAGGER } from "@/lib/motion";

/**
 * The mono "instrument voice" — index + hairline rule + kicker, characters
 * typing in like a readout (stepped, no ease: instrumentation, not prose).
 * Static text is the server/no-JS/reduced-motion base.
 */
export default function KickerLabel({
  index,
  text,
  className = "",
}: {
  index?: string;
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !motionOK()) return;
      registerMotion();
      const target = root.querySelector("[data-kicker-text]");
      if (!target) return;

      const split = SplitText.create(target, {
        type: "chars",
        autoSplit: true,
        onSplit(self) {
          return gsap.from(self.chars, {
            opacity: 0,
            duration: 0.01,
            ease: "none",
            stagger: STAGGER.chars,
            scrollTrigger: { trigger: root, start: "top 85%", once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={`flex items-center gap-3 ${className}`}>
      {index && (
        <>
          <span className="mono text-[12px] text-[color:var(--color-signal)]">{index}</span>
          <span aria-hidden className="h-px w-8 bg-[color:var(--color-edge)]" />
        </>
      )}
      <span data-kicker-text className="kicker">
        {text}
      </span>
    </div>
  );
}
