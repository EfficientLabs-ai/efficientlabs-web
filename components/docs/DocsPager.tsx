// DocsPager — prev/next, derived from the linear order of data/docs.ts.
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPager } from "@/data/docs";

export default function DocsPager({ slug }: { slug: string }) {
  const { prev, next } = getPager(slug);
  if (!prev && !next) return null;

  return (
    <nav aria-label="Pagination" className="mt-12 grid gap-4 border-t border-[color:var(--color-line)] pt-8 sm:grid-cols-2">
      {prev ? (
        <a href={`/docs/${prev.slug}`} className="data-card is-interactive flex flex-col gap-1 p-4 text-left">
          <span className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
            <ArrowLeft size={13} aria-hidden /> Previous
          </span>
          <span className="text-[15px] font-semibold text-[color:var(--color-ink)]">{prev.title}</span>
        </a>
      ) : <span aria-hidden />}

      {next ? (
        <a href={`/docs/${next.slug}`} className="data-card is-interactive flex flex-col items-end gap-1 p-4 text-right sm:col-start-2">
          <span className="mono inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
            Next <ArrowRight size={13} aria-hidden />
          </span>
          <span className="text-[15px] font-semibold text-[color:var(--color-ink)]">{next.title}</span>
        </a>
      ) : <span aria-hidden />}
    </nav>
  );
}
