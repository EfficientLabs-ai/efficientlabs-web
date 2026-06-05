// DocsBreadcrumb — server component. Docs / Section / Page.
import { ChevronRight } from "lucide-react";

export default function DocsBreadcrumb({ crumbs }: { crumbs: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mono flex flex-wrap items-center gap-1.5 text-[12px]">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="flex items-center gap-1.5">
            {c.href && !last ? (
              <a href={c.href} className="text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-ink-dim)]">
                {c.label}
              </a>
            ) : (
              <span className={last ? "text-[color:var(--color-ink-dim)]" : "text-[color:var(--color-ink-faint)]"}>
                {c.label}
              </span>
            )}
            {!last && <ChevronRight size={12} aria-hidden className="text-[color:var(--color-ink-faint)]/60" />}
          </span>
        );
      })}
    </nav>
  );
}
