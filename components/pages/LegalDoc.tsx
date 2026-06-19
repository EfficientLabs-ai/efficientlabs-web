import type { ReactNode } from "react";
import PageShell from "@/components/PageShell";

/**
 * Shared layout for the legal / trust pages (privacy, terms, security). Keeps
 * them visually consistent with the site and readable via .prose-docs. Content
 * is the founder's domain — these are reasonable, honest starting drafts and
 * should be reviewed by counsel before they're treated as binding.
 */
export default function LegalDoc({
  title,
  updated,
  intro,
  children,
}: {
  title: string;
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <div className="mx-auto max-w-3xl py-6">
        <p className="kicker">Legal</p>
        <h1 className="t-display-sm mt-4">{title}</h1>
        <p className="mono mt-3 text-[12px] text-[color:var(--color-ink-faint)]">Effective {updated}</p>
        {intro && <p className="mt-6 text-[15px] leading-relaxed text-[color:var(--color-ink-dim)]">{intro}</p>}
        <div className="prose-docs mt-8">{children}</div>
      </div>
    </PageShell>
  );
}
