"use client";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { siGithub, siX } from "simple-icons";
import { TextHoverEffect, FooterBackgroundGradient } from "@/components/ui/hover-footer";

const COLUMNS = [
  { title: "Platform", links: [["The Atmosphere", "/#atmosphere"], ["StratosAgent", "/#stratos"], ["Architecture", "/#architecture"], ["Honest status", "/#status"], ["Updates", "/updates"]] },
  { title: "Company", links: [["Manifesto", "#"], ["Pricing", "/pricing"], ["Sovereignty Audit", "mailto:hello@efficientlabs.ai?subject=Sovereignty%20Audit"], ["Careers", "#"]] },
] as const;

const CONTACT: { icon: typeof Mail; text: string; href?: string }[] = [
  { icon: Mail, text: "hello@efficientlabs.ai", href: "mailto:hello@efficientlabs.ai" },
  { icon: Phone, text: "+1 (307) 204-6634", href: "tel:+13072046634" },
  { icon: MapPin, text: "Sheridan, Wyoming, USA" },
];

const SOCIAL: { brand?: { path: string }; icon?: typeof Globe; label: string; href: string }[] = [
  { brand: siGithub, label: "GitHub", href: "https://github.com/EfficientLabs-ai" },
  { brand: siX, label: "X", href: "https://x.com/efficientlabs" },
  { icon: Globe, label: "Website", href: "https://efficientlabs.ai" },
];

export default function Footer() {
  return (
    <footer className="relative mt-8 overflow-hidden border-t border-[color:var(--color-line)]">
      <FooterBackgroundGradient />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16">
        <div className="grid grid-cols-1 gap-12 pb-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-16">
          {/* brand */}
          <div className="flex flex-col gap-4">
            <span className="wordmark items-start">
              <span className="wm-text" style={{ fontSize: 16, letterSpacing: "0.16em" }}>Efficient&nbsp;Labs</span>
            </span>
            <p className="text-sm leading-relaxed text-[color:var(--color-ink-dim)]">
              Sovereign AI infrastructure. Your agents, your hardware, your rules — content-addressed,
              capability-secured, post-quantum.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="mb-5 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--color-ink)]">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} className="text-sm text-[color:var(--color-ink-dim)] transition-colors hover:text-[color:var(--color-signal)]">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* contact */}
          <div>
            <h4 className="mb-5 text-[13px] font-semibold uppercase tracking-wider text-[color:var(--color-ink)]">Contact</h4>
            <ul className="space-y-4">
              {CONTACT.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-[color:var(--color-ink-dim)]">
                  <item.icon size={16} className="text-[color:var(--color-signal)]" />
                  {item.href
                    ? <a href={item.href} className="transition-colors hover:text-[color:var(--color-signal)]">{item.text}</a>
                    : <span>{item.text}</span>}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="border-t border-[color:var(--color-line)]" />

        <div className="flex flex-col items-center justify-between gap-4 py-7 text-sm md:flex-row">
          <div className="flex gap-6 text-[color:var(--color-ink-faint)]">
            {SOCIAL.map(({ brand, icon: Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                 className="text-[color:var(--color-ink-faint)] transition-colors hover:text-[color:var(--color-signal)]">
                {brand
                  ? <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden><path d={brand.path} /></svg>
                  : Icon ? <Icon size={18} /> : null}
              </a>
            ))}
          </div>
          <p className="mono text-center text-[11px] leading-relaxed text-[color:var(--color-ink-faint)] md:text-right">
            Efficiens Laboratorium Inc · DBA Efficient Labs Inc. · Wyoming C Corp · 30 N Gould St #35348, Sheridan, WY 82801<br />
            © 2026 Efficient Labs Inc. All rights reserved.
          </p>
        </div>
      </div>

      {/* giant interactive wordmark watermark */}
      <div className="relative z-10 -mb-10 -mt-6 hidden h-[18rem] items-end justify-center lg:flex">
        <TextHoverEffect text="Efficient Labs" />
      </div>
    </footer>
  );
}
