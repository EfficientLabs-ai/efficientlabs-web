"use client";
import { Share2, ShieldCheck, Eye } from "lucide-react";
import { Reveal, ActHeader } from "@/components/Reveal";

const MOATS = [
  {
    icon: Share2,
    title: "Meshed",
    body: "Peer-to-peer with no open ports. Your node hole-punches into the world directly — nothing to scan, seize, or DDoS. The mesh is the moat, not the agent loop.",
  },
  {
    icon: ShieldCheck,
    title: "Sealed",
    body: "Post-quantum signatures and a hardened capability sandbox. The remote-code and exfiltration class that plagues today's self-hosted agents simply can't reach you.",
  },
  {
    icon: Eye,
    title: "Sensing",
    body: "Eyes, ears, and a voice — screen, audio, and speech, all processed on your own machine. Ambient awareness without a single byte leaving your hardware.",
  },
];

export default function Differentiators() {
  return (
    <section className="relative border-t border-[color:var(--color-line)] py-28 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl">
          <ActHeader index="—" kicker="Why it's different" title={<>Running locally is <span className="aurora-text">table stakes</span>.</>}>
            Plenty of agents now run on your own hardware. The moat isn&apos;t where the model
            runs — it&apos;s the network underneath it, the seal around it, and the senses it has.
            This is the end-to-end principle, reborn for the age of agents.
          </ActHeader>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {MOATS.map((m, i) => (
              <Reveal key={m.title} delay={0.06 * i}>
                <div className="lm-card group h-full p-6">
                  <div className="glass grid h-11 w-11 place-items-center rounded-xl text-[color:var(--color-signal)]">
                    <m.icon size={19} />
                  </div>
                  <h3 className="display mt-5 text-[1.2rem] text-[color:var(--color-ink)]">{m.title}</h3>
                  <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{m.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
