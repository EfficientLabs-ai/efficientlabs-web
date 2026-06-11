// THESIS STRIP — extracted verbatim from app/page.tsx so it can be reused on
// both the landing scroll and the standalone /architecture page. Render this
// inside <main> as a top-level section (it carries its own `section`/`section-t`
// spacing and `container-x`).
import SectionCTA from "@/components/SectionCTA";

export default function Architecture() {
  return (
    <section id="architecture" className="section section-t relative overflow-hidden">
      {/* restrained depth: faint grid texture + a soft off-center vignette behind content */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            maskImage: "radial-gradient(120% 90% at 30% 40%, #000 0%, transparent 72%)",
            WebkitMaskImage: "radial-gradient(120% 90% at 30% 40%, #000 0%, transparent 72%)",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
            backgroundSize: "46px 46px",
          }}
        />
        <div
          className="absolute left-[18%] top-1/2 h-[34rem] w-[34rem] -translate-y-1/2 rounded-full opacity-[0.1] blur-[120px]"
          style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }}
        />
      </div>
      <div className="container-x grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="kicker">The thesis</p>
          <h2 className="t-section mt-5">
            Automate the <span className="aurora-text">file architecture</span>, not the AI wrapper.
          </h2>
          <p className="mt-6 text-[color:var(--color-ink-dim)] leading-relaxed">
            Agents are expensive, non-reproducible glue. A correctly-designed file and
            dataflow architecture does the work deterministically, cheaply, and auditably —
            and the agent earns its place only where genuine ambiguity lives. The sections
            below don&apos;t describe the architecture. They run it.
          </p>
          <ul className="mt-7 grid grid-cols-3 gap-4">
            {[["Deterministic", "same input, same output"], ["Auditable", "every step inspectable"], ["Cheap", "glue work, not tokens"]].map(([h, d]) => (
              <li key={h}>
                <p className="mono text-[13px] font-semibold text-[color:var(--color-ink)]">{h}</p>
                <p className="mt-0.5 text-[12px] text-[color:var(--color-ink-faint)]">{d}</p>
              </li>
            ))}
          </ul>
          <SectionCTA label="Read the full architecture" href="/architecture" />
        </div>
        <div className="lm-card overflow-hidden p-1.5">
          <video
            className="w-full rounded-[var(--radius)]"
            src="/video/thesis-architecture.mp4"
            poster="/img/thesis-architecture.png"
            autoPlay muted loop playsInline preload="metadata"
            aria-label="Software file-architecture rendered as luminous living infrastructure — data flowing through glowing directory modules and brushed-chrome conduits"
          />
        </div>
      </div>
    </section>
  );
}
