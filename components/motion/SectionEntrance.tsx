"use client";
import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { registerMotion, motionOK, EASE, DUR, STAGGER } from "@/lib/motion";

/**
 * Role-based section choreography. Children stay server-rendered; roles are
 * marked with data-motion="kicker|heading|body|card|cta" attributes and the
 * variant decides the order of the gesture:
 *  - statement: body trails the (self-animating) heading, cards follow
 *  - proof:     tiles overlap-stagger in; CountUp numbers fire themselves
 *  - act:       demo panel slides last, after the header voice
 * One timeline per section; the section animates on entry, then RESTS.
 */
export default function SectionEntrance({
  variant,
  children,
  className = "",
}: {
  variant: "statement" | "proof" | "act";
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || !motionOK()) return;
      registerMotion();
      const q = (role: string) =>
        gsap.utils.toArray<HTMLElement>(
          root.querySelectorAll(`[data-motion="${role}"]`),
        );
      const body = q("body");
      const cards = q("card");
      const cta = q("cta");
      const panel = q("panel");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 75%", once: true },
        defaults: { ease: EASE.out, duration: DUR.secondary },
      });

      if (variant === "statement") {
        if (body.length) tl.from(body, { y: 18, opacity: 0, stagger: 0.08 }, 0.15);
        if (cards.length) tl.from(cards, { y: 26, opacity: 0, stagger: STAGGER.cards }, 0.3);
      } else if (variant === "proof") {
        if (cards.length) tl.from(cards, { y: 26, opacity: 0, stagger: STAGGER.cards }, 0);
        if (body.length) tl.from(body, { y: 14, opacity: 0 }, 0.2);
      } else {
        if (body.length) tl.from(body, { y: 18, opacity: 0, stagger: 0.08 }, 0.1);
        if (panel.length) tl.from(panel, { y: 30, opacity: 0, duration: DUR.hero * 0.7 }, 0.3);
        if (cards.length) tl.from(cards, { y: 26, opacity: 0, stagger: STAGGER.cards }, 0.35);
      }
      if (cta.length) tl.from(cta, { y: 12, opacity: 0 }, ">-0.25");
    },
    { dependencies: [variant], scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
