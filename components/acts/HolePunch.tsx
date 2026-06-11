"use client";
import { motion } from "motion/react";
import { ActHeader, Reveal } from "@/components/Reveal";

const EASE = [0.2, 0.8, 0.2, 1] as const;

function Peer({ x, label, ip }: { x: number; label: string; ip: string }) {
  return (
    <g>
      <rect x={x - 46} y={150} width={92} height={64} rx={10} fill="#0a0c12" stroke="#1a2330" />
      <text x={x} y={138} textAnchor="middle" className="mono" fontSize="10" fill="#5b6675">{`NAT · ${ip}`}</text>
      <circle cx={x} cy={182} r={15} fill="#05070b" stroke="#0a84ff" strokeWidth="1.5" />
      <circle cx={x} cy={182} r={4} fill="#0a84ff" />
      <text x={x} y={236} textAnchor="middle" className="mono" fontSize="11" fill="#9aa6b4">{label}</text>
    </g>
  );
}

export default function HolePunch() {
  return (
    <div className="grid items-center gap-14 lg:grid-cols-2">
      <Reveal delay={0.1} className="order-2 lg:order-1">
        <svg viewBox="0 0 520 280" className="w-full">
          {/* DHT rendezvous */}
          <g>
            <ellipse cx={260} cy={48} rx={70} ry={26} fill="#0a0c12" stroke="#1a2330" />
            <text x={260} y={44} textAnchor="middle" className="mono" fontSize="10" fill="#3db1ff">Hyperswarm</text>
            <text x={260} y={58} textAnchor="middle" className="mono" fontSize="9" fill="#5b6675">DHT rendezvous</text>
          </g>

          <Peer x={90} label="StratosAgent — you" ip="198.51.100.7" />
          <Peer x={430} label="peer" ip="203.0.113.9" />

          {/* registration to DHT (dashed, ephemeral) */}
          {[ [90, 188], [430, 360] ].map(([x], i) => (
            <motion.line
              key={i}
              x1={x} y1={167} x2={260} y2={70}
              stroke="#3db1ff" strokeWidth="1" strokeDasharray="3 4"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.55 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.1 + i * 0.15 }}
            />
          ))}

          {/* the punched, direct link (solid signal) */}
          <motion.line
            x1={120} y1={182} x2={400} y2={182}
            stroke="#0a84ff" strokeWidth="1.6"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
          />
          {/* packet traveling the direct link */}
          <motion.circle
            r={3} fill="#0a84ff"
            initial={{ cx: 120, cy: 182, opacity: 0 }}
            whileInView={{ cx: 400, opacity: [0, 1, 1, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: "easeInOut", delay: 1.5, repeat: Infinity, repeatDelay: 0.6 }}
          />
          <motion.text
            x={260} y={205} textAnchor="middle" className="mono" fontSize="10" fill="#0a84ff"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            direct · encrypted · no open ports
          </motion.text>
        </svg>
      </Reveal>

      <div className="order-1 lg:order-2">
        <ActHeader index="02" kicker="NAT traversal" title={<>Nothing to <span className="aurora-text">attack</span>.</>}>
          Your node never opens an inbound port — so there is nothing to scan, nothing to seize,
          and nothing to take down. Two nodes meet through a public directory, then punch a direct,
          end-to-end-encrypted line between them. The network introduces them; it never sits in
          the middle.
        </ActHeader>

        <Reveal delay={0.2}>
          <ul className="mt-7 space-y-3">
            {[
              ["Invisible to scanners", "No listening port exists to find or fingerprint."],
              ["Nothing to seize", "No public endpoint or server to subpoena, pull, or shut off."],
              ["No DDoS target", "There is no front door to flood — only direct, consented links."],
            ].map(([h, d]) => (
              <li key={h} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--color-signal)] shadow-[0_0_10px_var(--color-signal)]" />
                <span className="text-[14px] text-[color:var(--color-ink-dim)]">
                  <span className="text-[color:var(--color-ink)]">{h}.</span> {d}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
