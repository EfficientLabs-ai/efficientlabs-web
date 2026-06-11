import Link from "next/link";

/**
 * The funnel's per-section next action — a quiet mono link row that closes
 * every scroll depth with exactly one door forward (content-engine thesis:
 * HOOK → CAPTURE → INFORM → SELL → CTA, repeated). One per section, never
 * competing with the page's primary CTAs.
 */
export default function SectionCTA({
  label,
  href,
  className = "",
}: {
  label: string;
  href: string;
  className?: string;
}) {
  return (
    <div className={`mt-10 ${className}`}>
      <Link
        href={href}
        className="group mono inline-flex items-center gap-2 text-[13px] text-[color:var(--color-signal)] transition-colors hover:text-[color:var(--color-quantum)]"
      >
        {label}
        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </Link>
    </div>
  );
}
