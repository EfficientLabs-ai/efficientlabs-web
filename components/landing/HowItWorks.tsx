import { ScanLine, Download, FileCheck2, Layers } from "lucide-react";
import Aurora from "@/components/glass/Aurora";
import GlassCard from "@/components/glass/GlassCard";
import KickerLabel from "@/components/motion/KickerLabel";
import SplitHeading from "@/components/motion/SplitHeading";
import { Reveal } from "@/components/Reveal";

/**
 * HOW IT WORKS — a stepped glass ladder. One low-risk next action throughout:
 * free assessment, free install. The paid surface ("Unlock depth") is named
 * honestly as later/optional, never gated in front of the free path.
 */
const STEPS = [
  {
    n: "01",
    icon: ScanLine,
    title: "See the gap",
    body: "Run the free readiness assessment. It scores how ready your AI stack is to be trusted — and shows you exactly where it isn't.",
  },
  {
    n: "02",
    icon: Download,
    title: "Install",
    body: "One line, free forever. StratosAgent runs on infrastructure you own, governed and bounded from the first command.",
  },
  {
    n: "03",
    icon: FileCheck2,
    title: "Own the proof",
    body: "Every action leaves a receipt — portable, offline-verifiable with a key alone. The proof is yours to keep and to check.",
  },
  {
    n: "04",
    icon: Layers,
    title: "Unlock depth",
    body: "Teams, governance, and settlement — when you're ready. Depth is opt-in; the foundation you start on never changes.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="section section-t relative overflow-hidden scroll-mt-20">
      <Aurora variant="right" />
      <div className="container-x relative">
        <div className="max-w-2xl">
          <KickerLabel index="03" text="How it works" />
          <SplitHeading as="h2" className="t-section mt-6">
            Start free. <span className="aurora-text">Own it in one line</span>.
          </SplitHeading>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={0.06 * i}>
              <GlassCard material="flat" as="li" className="flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="glass grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] text-[color:var(--color-signal)]">
                    <s.icon size={18} aria-hidden />
                  </span>
                  <span className="mono text-[12px] tracking-[0.2em] text-[color:var(--color-ink-faint)]">
                    {s.n}
                  </span>
                </div>
                <h3 className="t-card mt-5">{s.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">
                  {s.body}
                </p>
              </GlassCard>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
