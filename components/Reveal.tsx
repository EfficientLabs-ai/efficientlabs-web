"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Scroll-triggered reveal. Motion as evidence, not decoration. */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.9, ease: EASE, delay }}
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
      <Reveal>
        <div className="flex items-center gap-3">
          <span className="mono text-[12px] text-[color:var(--color-signal)]">{index}</span>
          <span className="h-px w-8 bg-[color:var(--color-edge)]" />
          <span className="kicker">{kicker}</span>
        </div>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="display mt-5 text-[clamp(1.7rem,3.4vw,2.8rem)] text-[color:var(--color-ink)]">
          {title}
        </h2>
      </Reveal>
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
