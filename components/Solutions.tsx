"use client";
import { MessageSquare, Cpu, Workflow, ShieldCheck } from "lucide-react";
import { Reveal, ActHeader } from "@/components/Reveal";
import BrandIcon from "@/components/BrandIcon";
import SectionCTA from "@/components/SectionCTA";

const ROW_A = ["MCP", "n8n", "Telegram", "Discord", "Slack", "Matrix", "Signal", "WhatsApp", "Ollama", "OpenRouter", "Anthropic", "OpenAI", "Mistral", "DeepSeek", "Qwen"];
const ROW_B = ["GitHub", "Notion", "Stripe", "Postgres", "Supabase", "Gmail", "Google Drive", "Linear", "Figma", "Vercel", "Cloudflare", "WASI"];

const STATS = [
  ["5", "native channels"],
  ["∞", "MCP tools"],
  ["400+", "n8n integrations"],
  ["any", "model — your keys"],
];

const VALUE = [
  { icon: MessageSquare, title: "Reach it anywhere", body: "One agent across Telegram, Discord, Slack, Matrix and Signal. Same memory, same rules, every inbox." },
  { icon: Cpu, title: "Bring your own model", body: "Routine work runs locally on Ollama; frontier models are reached only when the ambiguity demands — and you hold the keys." },
  { icon: Workflow, title: "Automate anything", body: "Speaks MCP and bridges n8n, so thousands of tools are wired in — every call gated by a capability token and a cost-approval loop." },
  { icon: ShieldCheck, title: "Own your data", body: "Content-addressed, capability-secured, post-quantum. No landlord can read it, throttle it, or switch it off." },
];

function Logo({ name }: { name: string }) {
  return (
    <span className="logo-float">
      <BrandIcon name={name} />
      {name}
    </span>
  );
}

export default function Solutions() {
  return (
    <section className="section section-t relative">
      <div className="container-x">
        <ActHeader index="—" kicker="Solutions & scale" title={<>Sovereign, <span className="aurora-text">not isolated</span>.</>}>
          Stratos speaks MCP and bridges n8n — so the thousands of tools in those ecosystems are
          wired in from day one. Reach your agent on any channel, point it at any model you bring,
          and automate anything — without ever handing your data to a platform.
        </ActHeader>

        {/* stat row — glass, lifted over an aurora glow so the frost reads */}
        <div className="relative mt-12">
          <div aria-hidden className="aurora-field">
            <div className="glow glow-azure left-1/2 top-1/2 h-[22rem] w-[40rem] -translate-x-1/2 -translate-y-1/2" />
            <div className="glow glow-cyan right-0 top-0 h-[18rem] w-[24rem]" />
          </div>
          <Reveal delay={0.1}>
          <div className="data-card relative z-10 grid grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
            {STATS.map(([n, l]) => (
              <div key={l} className="px-3 py-6 text-center sm:px-6 sm:py-7">
                <div className="t-stat text-[color:var(--color-signal)]">{n}</div>
                <div className="mono mt-1 text-[11px] leading-snug text-[color:var(--color-ink-faint)] sm:text-[12px]">{l}</div>
              </div>
            ))}
          </div>
          </Reveal>
        </div>
      </div>

      {/* integration marquee — real logos, floating, full bleed */}
      <div className="mt-14 space-y-5">
        <div className="marquee">
          <div className="marquee-track">
            {[...ROW_A, ...ROW_A].map((x, i) => <Logo key={`a${i}`} name={x} />)}
          </div>
        </div>
        <div className="marquee">
          <div className="marquee-track rev">
            {[...ROW_B, ...ROW_B].map((x, i) => <Logo key={`b${i}`} name={x} />)}
          </div>
        </div>
      </div>

      {/* value cards — liquid-metal glass */}
      <div className="container-x mt-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE.map((v, i) => (
            <Reveal key={v.title} delay={0.05 * i}>
              <div className="data-card group h-full p-6">
                <div className="glass grid h-11 w-11 place-items-center rounded-[var(--radius-sm)] text-[color:var(--color-signal)]">
                  <v.icon size={19} />
                </div>
                <h3 className="t-card mt-5">{v.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[color:var(--color-ink-dim)]">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <SectionCTA label="Install StratosAgent on your own metal" href="/install" />
        </Reveal>
      </div>
    </section>
  );
}
