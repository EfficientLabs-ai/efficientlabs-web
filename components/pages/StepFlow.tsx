import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

export type Step = { title: string; body: ReactNode };

/**
 * A vertical numbered flow with a connecting spine — used by the deep pages to
 * walk through a sequence (how a node joins the mesh, how a prompt routes, what
 * the installer does). Denser and more "explanatory" than the homepage step
 * lists; carries the chapter-narrative of an in-depth page.
 */
export default function StepFlow({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative space-y-5">
      {/* spine */}
      <span
        aria-hidden
        className="absolute bottom-6 left-[14px] top-6 w-px bg-gradient-to-b from-[color:var(--color-signal)]/40 via-[color:var(--color-line)] to-transparent"
      />
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.06}>
          <li className="relative flex gap-4">
            <span className="mono z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[color:var(--color-signal)]/35 bg-[color:var(--color-void)] text-[12px] text-[color:var(--color-signal)]">
              {i + 1}
            </span>
            <div className="data-card flex-1 p-5">
              <h3 className="text-[15px] font-semibold text-[color:var(--color-ink)]">{s.title}</h3>
              <div className="mt-1.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{s.body}</div>
            </div>
          </li>
        </Reveal>
      ))}
    </ol>
  );
}
