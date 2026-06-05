"use client";
// DocsToc — sticky "On this page" with IntersectionObserver scroll-spy.
import { useEffect, useState } from "react";
import type { Heading } from "@/data/docs";

export default function DocsToc({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    if (!headings.length) return;
    const els = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => !!el);
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headings.map((h) => h.id).join("|")]);

  if (!headings.length) return null;

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="mono mb-3 text-[0.7rem] uppercase tracking-[0.22em] text-[color:var(--color-ink-faint)]">
        On this page
      </p>
      <ul className="space-y-1">
        {headings.map((h) => {
          const isActive = active === h.id;
          return (
            <li key={h.id} style={{ paddingLeft: h.level === 3 ? "0.85rem" : 0 }}>
              <a
                href={`#${h.id}`}
                className="block py-0.5 transition-colors"
                style={{ color: isActive ? "var(--color-signal)" : "var(--color-ink-faint)" }}
                aria-current={isActive ? "true" : undefined}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
