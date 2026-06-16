import { HardDrive, ShieldCheck, FileCheck2, Gauge, Sparkles, Terminal, Stamp } from "lucide-react";
import Aurora from "@/components/glass/Aurora";
import GlassCard from "@/components/glass/GlassCard";
import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";
import SectionEntrance from "@/components/motion/SectionEntrance";
import { Reveal } from "@/components/Reveal";

/**
 * THE ANSWER — the ownership layer that turns an unaccountable action into an
 * accountable one. Centerpiece: a pure-CSS "accountability pipeline" where an
 * intent travels the chain (Intent → Authority → Execution → Receipt →
 * Measured) and each node lights as it passes — answering the gap named in The
 * Stakes. Below: the four outcomes you get. Copy aligned to WEBSITE_COPY_V2 §3.
 * Server component (animation is CSS) so all copy ships in the SSR payload.
 */
const STAGES = [
  { title: "INTENT", sub: "A request to act", icon: Sparkles, c: "#0a84ff" },
  { title: "AUTHORITY", sub: "Approved or denied", icon: ShieldCheck, c: "#8b5cf6" },
  { title: "EXECUTION", sub: "Governed hands act", icon: Terminal, c: "#0a84ff" },
  { title: "RECEIPT", sub: "Signed proof", icon: Stamp, c: "#22d3ee" },
  { title: "MEASURED", sub: "Evaluated & ready", icon: Gauge, c: "#3ddc97" },
];

const PILLARS = [
  { icon: HardDrive, title: "OWN", body: "Your models, memory, and state live on infrastructure you control. No landlord, no lock-in." },
  { icon: ShieldCheck, title: "GOVERN", body: "Every action is authorized and bounded by default. Nothing runs without permission you set." },
  { icon: FileCheck2, title: "PROVE", body: "Receipt-backed execution — tamper-evident proof of who did what, verifiable with a key alone." },
  { icon: Gauge, title: "MEASURE", body: "Know how ready your AI stack is to be trusted — measured, with the gaps shown honestly." },
];

export default function Answer() {
  return (
    <section id="answer" className="section section-t relative overflow-hidden scroll-mt-20">
      <Aurora variant="wide" />
      <SectionEntrance variant="statement" className="container-x relative">
        <div className="mx-auto max-w-2xl text-center">
          <KickerLabel index="02" text="The ownership layer" />
          <SplitHeading as="h2" className="t-section mt-6">
            Turn an action into <span className="aurora-text">an accountable one</span>.
          </SplitHeading>
          <Reveal delay={0.14}>
            <p className="t-body-lg mt-7 text-[color:var(--color-ink-dim)]">
              Efficient Labs is the ownership and governance layer for autonomous intelligence —
              the operating environment where every action earns the right to act, and proves it.
            </p>
          </Reveal>
        </div>

        {/* the accountability pipeline — an intent travels the chain */}
        <div className="acc-pipe relative mx-auto mt-14 max-w-4xl">
          <div className="acc-track top-7" />
          <div className="acc-particle top-7" />
          <div className="relative grid grid-cols-5 gap-1 sm:gap-2">
            {STAGES.map((s, i) => (
              <div key={s.title} className="flex flex-col items-center text-center"
                   style={{ ["--acc-c" as string]: s.c, ["--acc-d" as string]: `${i * 1.5}s` }}>
                <span className="acc-pop glass relative grid h-14 w-14 place-items-center rounded-full"
                      style={{ borderColor: `color-mix(in oklab, ${s.c} 30%, transparent)` }}>
                  <span className="acc-glow" />
                  <s.icon size={20} aria-hidden style={{ color: s.c }} />
                </span>
                <span className="mono mt-3 text-[10px] tracking-[0.12em] sm:text-[11px]" style={{ color: s.c }}>{s.title}</span>
                <span className="mt-1 hidden text-[11.5px] text-[color:var(--color-ink-faint)] sm:block">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* the outcomes */}
        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <GlassCard key={p.title} data-motion="card" className="flex h-full flex-col p-6">
              <span className="glass grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] text-[color:var(--color-signal)]">
                <p.icon size={19} aria-hidden />
              </span>
              <h3 className="mono mt-5 text-[13px] tracking-[0.24em] text-[color:var(--color-ink)]">{p.title}</h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{p.body}</p>
            </GlassCard>
          ))}
        </div>
      </SectionEntrance>
    </section>
  );
}
