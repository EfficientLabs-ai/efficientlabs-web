import Aurora from "@/components/glass/Aurora";
import GlassCard from "@/components/glass/GlassCard";
import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/Reveal";
import SectionCTA from "@/components/SectionCTA";

/**
 * HONEST READINESS LADDER — honesty as the trust signal, rendered as an actual
 * vertical ladder: a rail from bedrock (Deep, green) up through Maturing (cyan)
 * to New (amber), a spark climbing it and each rung-node glowing as the eye
 * descends. The counter-signal to overclaiming competitors — the green you can
 * check yourself is the only green worth anything. Generic labels, no invented
 * metrics (honesty-guard-safe). Server-rendered; CSS-only motion (.ladder-*).
 */
const RUNGS = [
  {
    tag: "Deep",
    c: "#3ddc97",
    title: "Proven and load-bearing",
    body: "The parts we lean on every day to run our own company — and that you can verify, not just take on faith.",
  },
  {
    tag: "Maturing",
    c: "#22d3ee",
    title: "Built, hardening in the open",
    body: "Connected and working, with the rough edges named in public rather than papered over.",
  },
  {
    tag: "New",
    c: "#f5a623",
    title: "Early, and labeled as early",
    body: "Recent additions we're honest about. You'll always know whether you're standing on bedrock or fresh ground.",
  },
];

export default function ReadinessLadder() {
  return (
    <section id="readiness" className="section section-t relative overflow-hidden scroll-mt-20">
      <Aurora variant="center" />
      <div className="container-x relative">
        <div className="max-w-2xl">
          <KickerLabel index="04" text="Honest readiness" />
          <SplitHeading as="h2" className="t-section mt-6">
            The strongest green is the one{" "}
            <span className="aurora-text">you can check yourself</span>.
          </SplitHeading>
          <Reveal delay={0.16}>
            <p className="t-body-lg mt-7 max-w-2xl text-[color:var(--color-ink-dim)]">
              Most platforms paint everything &ldquo;done&rdquo; and ask you to trust the colour.
              We show what&apos;s deep, what&apos;s new, and what&apos;s still maturing — labeled
              honestly. The honesty isn&apos;t a disclaimer; it&apos;s the trust signal.
            </p>
          </Reveal>
        </div>

        {/* the ladder — a rail from bedrock up, a spark climbing it */}
        <div className="ladder mx-auto mt-12 max-w-3xl" style={{ ["--ladder-h" as string]: "440px" }}>
          <span className="ladder-rail" aria-hidden />
          <span className="ladder-spark" aria-hidden />
          <div className="flex flex-col gap-5">
            {RUNGS.map((r, i) => (
              <Reveal key={r.tag} delay={0.06 * i}>
                <div className="grid grid-cols-[28px_1fr] items-start gap-5">
                  {/* rail node */}
                  <span className="relative mt-5 flex justify-center">
                    <span
                      className="ladder-node grid h-3.5 w-3.5 place-items-center rounded-full"
                      style={{
                        ["--rung-c" as string]: r.c,
                        ["--rung-d" as string]: `${i * 0.6}s`,
                        background: r.c,
                        boxShadow: `0 0 0 4px color-mix(in oklab, ${r.c} 18%, transparent)`,
                      }}
                      aria-hidden
                    />
                  </span>
                  <GlassCard className="flex flex-col p-6">
                    <span
                      className="mono inline-flex w-fit items-center gap-2 rounded-[var(--radius-pill)] px-3 py-1 text-[11px] tracking-[0.18em]"
                      style={{ color: r.c, border: `1px solid color-mix(in oklab, ${r.c} 38%, transparent)`, background: `color-mix(in oklab, ${r.c} 10%, transparent)` }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: r.c }} aria-hidden />
                      {r.tag}
                    </span>
                    <h3 className="t-card mt-5">{r.title}</h3>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
                      {r.body}
                    </p>
                  </GlassCard>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.2}>
          <SectionCTA label="See the honest status matrix" href="/status" />
        </Reveal>
      </div>
    </section>
  );
}
