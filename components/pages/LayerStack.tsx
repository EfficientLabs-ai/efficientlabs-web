import { LAYERS, TONE } from "@/lib/architecture-layers";
import { Reveal } from "@/components/Reveal";

/**
 * THE 8-LAYER STACK — a signature diagram for /architecture: the eight
 * foundational layers stacked from bedrock (Layer 1 · Intelligence, bottom) up
 * to Layer 8 · Financial, with a spark climbing the rail and each layer-node
 * glowing in turn as the stack "builds" bottom-up. Server-rendered; CSS-only
 * motion (.lstack-*), reduced-motion shows the lit static stack. Data is the
 * canonical LAYERS source of truth — never duplicated here.
 */
export default function LayerStack() {
  // top → bottom = Layer 8 … Layer 1, so the foundation sits at the base.
  const rows = [...LAYERS].reverse();
  return (
    <div className="lstack mx-auto max-w-2xl" style={{ ["--lstack-h" as string]: "452px" }}>
      <span className="lstack-rail" aria-hidden />
      <span className="lstack-spark" aria-hidden />
      <div className="flex flex-col gap-3">
        {rows.map((l, i) => {
          const hex = TONE[l.tone].hex;
          const fromBottom = rows.length - 1 - i; // 0 = bottom row
          return (
            <Reveal key={l.n} delay={0.04 * fromBottom}>
              <div className="grid grid-cols-[44px_1fr] items-center gap-4">
                <span className="relative flex justify-center">
                  <span
                    className="lstack-node mono grid h-9 w-9 place-items-center rounded-full text-[12px] font-semibold"
                    style={{
                      ["--ln-c" as string]: hex,
                      ["--ln-d" as string]: `${0.52 + fromBottom * 0.6}s`,
                      color: hex,
                      background: `color-mix(in oklab, ${hex} 14%, transparent)`,
                      border: `1px solid color-mix(in oklab, ${hex} 40%, transparent)`,
                    }}
                  >
                    {l.n}
                  </span>
                </span>
                <div className="glass flex items-center justify-between gap-3 rounded-[var(--radius)] px-4 py-3">
                  <span className="text-[14px] font-semibold text-[color:var(--color-ink)]">{l.name}</span>
                  <span className="mono text-[11px] tracking-[0.12em]" style={{ color: hex }}>{l.role}</span>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
