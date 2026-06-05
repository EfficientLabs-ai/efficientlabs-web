import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocsBreadcrumb from "@/components/docs/DocsBreadcrumb";
import ArticleBody from "@/components/docs/ArticleBody";
import DocsToc from "@/components/docs/DocsToc";
import DocsPager from "@/components/docs/DocsPager";
import DocsHelpful from "@/components/docs/DocsHelpful";
import { ARTICLES, getArticle, getHeadings } from "@/data/docs";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: "Not found" };
  return {
    title: article.title,
    description: article.description,
    alternates: { canonical: `/docs/${slug}` },
  };
}

export default async function DocArticle({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const headings = getHeadings(article);

  return (
    <>
      {/* content column */}
      <article id="docs-content" className="min-w-0 py-8 lg:py-10">
        <DocsBreadcrumb
          crumbs={[
            { label: "Docs", href: "/docs" },
            { label: article.group },
            { label: article.title },
          ]}
        />

        <h1 className="t-section mt-4">{article.title}</h1>
        <p className="t-body-lg mt-3 max-w-[46rem] text-[color:var(--color-ink-dim)]">{article.description}</p>

        {/* inline collapsible TOC for mobile/tablet (sticky TOC is desktop-only) */}
        {headings.length > 0 && (
          <details className="not-prose mt-6 rounded-[var(--radius)] border border-[color:var(--color-line)] bg-[color:var(--color-void-2)]/40 lg:hidden">
            <summary className="mono cursor-pointer list-none px-4 py-3 text-[0.72rem] uppercase tracking-[0.2em] text-[color:var(--color-ink-faint)] [&::-webkit-details-marker]:hidden">
              On this page
            </summary>
            <ul className="space-y-1 px-4 pb-4 text-[13px]">
              {headings.map((h) => (
                <li key={h.id} style={{ paddingLeft: h.level === 3 ? "0.85rem" : 0 }}>
                  <a href={`#${h.id}`} className="text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-signal)]">
                    {h.text}
                  </a>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-8 max-w-[46rem]">
          <ArticleBody blocks={article.blocks} />
        </div>

        <div className="max-w-[46rem]">
          <DocsHelpful updated={article.updated} />
          <DocsPager slug={slug} />
        </div>
      </article>

      {/* sticky on-this-page TOC — desktop only */}
      <aside
        className="hidden lg:block"
        style={{ position: "sticky", top: "5rem", height: "calc(100dvh - 5rem)", overflowY: "auto" }}
      >
        <div className="py-10 pl-2">
          <DocsToc headings={headings} />
        </div>
      </aside>
    </>
  );
}
