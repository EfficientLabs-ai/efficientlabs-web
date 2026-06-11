"use client";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { EASE_CSS, DUR } from "@/lib/motion";
import SplitHeading from "@/components/motion/SplitHeading";
import KickerLabel from "@/components/motion/KickerLabel";

/** Scroll-triggered reveal — the workhorse for card/body staggers. Ease and
 *  duration come from the written motion system (lib/motion.ts), so all 71
 *  call sites share the house curve. Honors prefers-reduced-motion. */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: DUR.secondary, ease: EASE_CSS, delay }}
    >
      {children}
    </motion.div>
  );
}

/** A labelled section shell: kicker + act number + heading + body, reused by every act. */
export function ActHeader({
  index,
  kicker,
  title,
  children,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-xl">
      <KickerLabel index={index} text={kicker} />
      <SplitHeading as="h2" className="t-section mt-5">
        {title}
      </SplitHeading>
      {children && (
        <Reveal delay={0.16}>
          <div className="mt-5 text-[1.02rem] leading-relaxed text-[color:var(--color-ink-dim)]">
            {children}
          </div>
        </Reveal>
      )}
    </div>
  );
}
