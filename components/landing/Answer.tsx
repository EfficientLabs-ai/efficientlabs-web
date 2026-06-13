import { HardDrive, ShieldCheck, FileCheck2, Gauge } from "lucide-react";
import Aurora from "@/components/glass/Aurora";
import GlassCard from "@/components/glass/GlassCard";
import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";
import SectionEntrance from "@/components/motion/SectionEntrance";

/**
 * THE ANSWER — four frosted pillar cards over an aurora, card-staggered in by
 * SectionEntrance (transform+opacity only). Each card resolves a piece of the
 * fear named in The Stakes. Specifics, not adjectives.
 */
const PILLARS = [
  {
    icon: HardDrive,
    title: "OWN",
    body: "Your models, memory, and state live on infrastructure you control. No landlord, no lock-in.",
  },
  {
    icon: ShieldCheck,
    title: "GOVERN",
    body: "Every action is authorized and bounded by default. Nothing runs without permission you set.",
  },
  {
    icon: FileCheck2,
    title: "PROVE",
    body: "Receipt-backed execution — tamper-evident proof of who did what, verifiable with a key alone.",
  },
  {
    icon: Gauge,
    title: "MEASURE",
    body: "Know how ready your AI stack is to be trusted — measured, with the gaps shown honestly.",
  },
];

export default function Answer() {
  return (
    <section id="answer" className="section section-t relative overflow-hidden scroll-mt-20">
      <Aurora variant="wide" />
      <SectionEntrance variant="statement" className="container-x relative">
        <div className="max-w-2xl">
          <KickerLabel index="02" text="The ownership layer" />
          <SplitHeading as="h2" className="t-section mt-6">
            The ownership layer for <span className="aurora-text">autonomous AI</span>.
          </SplitHeading>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => (
            <GlassCard key={p.title} data-motion="card" className="flex h-full flex-col p-6">
              <span className="glass grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] text-[color:var(--color-signal)]">
                <p.icon size={19} aria-hidden />
              </span>
              <h3 className="mono mt-5 text-[13px] tracking-[0.24em] text-[color:var(--color-ink)]">
                {p.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
                {p.body}
              </p>
            </GlassCard>
          ))}
        </div>
      </SectionEntrance>
    </section>
  );
}
