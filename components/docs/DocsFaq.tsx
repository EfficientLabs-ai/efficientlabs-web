"use client";
// DocsFaq — accordion of Q&A using native <details> with a rotating caret.
import { ChevronDown } from "lucide-react";

export default function DocsFaq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="not-prose my-4 space-y-3">
      {items.map((it, i) => (
        <details
          key={i}
          className="group data-card overflow-hidden"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-semibold text-[color:var(--color-ink)] [&::-webkit-details-marker]:hidden">
            {it.q}
            <ChevronDown
              size={17}
              aria-hidden
              className="shrink-0 text-[color:var(--color-ink-faint)] transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <div className="px-4 pb-4 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
            {it.a}
          </div>
        </details>
      ))}
    </div>
  );
}
