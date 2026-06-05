// ArticleBody — server component. Renders the typed content blocks of an article
// into .prose-docs markup. No MDX; bodies are typed React from data/docs.ts.
import CodeBlock from "@/components/docs/CodeBlock";
import Callout from "@/components/docs/Callout";
import { CapStatus } from "@/components/docs/StatusBadge";
import type { Block } from "@/data/docs";
import DocsFaq from "@/components/docs/DocsFaq";

export default function ArticleBody({ blocks }: { blocks: Block[] }) {
  return (
    <div className="prose-docs">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "p":
            return <p key={i}>{b.text}</p>;
          case "h2":
            return <h2 key={i} id={b.id}>{b.text}</h2>;
          case "h3":
            return <h3 key={i} id={b.id}>{b.text}</h3>;
          case "ul":
            return <ul key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
          case "ol":
            return <ol key={i}>{b.items.map((it, j) => <li key={j}>{it}</li>)}</ol>;
          case "code":
            return <CodeBlock key={i} lang={b.lang} code={b.code} />;
          case "tabs":
            return <CodeBlock key={i} tabs={b.tabs} />;
          case "callout":
            return (
              <Callout key={i} variant={b.variant} title={b.title}>
                {b.text}
              </Callout>
            );
          case "status":
            return (
              <div key={i} className="not-prose my-6 space-y-2">
                {b.caps.map((name) => <CapStatus key={name} name={name} />)}
              </div>
            );
          case "table":
            return (
              <div key={i} className="not-prose my-6 overflow-x-auto">
                <table className="w-full border-collapse text-[14px]">
                  <thead>
                    <tr>
                      {b.head.map((h) => (
                        <th key={h} className="mono border-b border-[color:var(--color-edge)] px-3 py-2 text-left text-[11px] uppercase tracking-wider text-[color:var(--color-ink-faint)]">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r}>
                        {row.map((cell, c) => (
                          <td key={c} className="border-b border-[color:var(--color-line)] px-3 py-2.5 text-[color:var(--color-ink-dim)]">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "faq":
            return <DocsFaq key={i} items={b.items} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
