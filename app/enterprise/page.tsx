import type { Metadata } from "next";
import { ShieldCheck, Server, FileCheck2, Users, Lock, Gauge } from "lucide-react";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import DeepSection from "@/components/pages/DeepSection";
import DeepCard from "@/components/pages/DeepCard";
import CalEmbed from "@/components/CalEmbed";
import SubPageCTA from "@/components/pages/SubPageCTA";

export const metadata: Metadata = {
  title: "Enterprise — sovereign AI infrastructure on your terms",
  description:
    "Deploy Efficient Labs across your organisation on infrastructure you own: governed autonomy, signed receipts for every action, and no data leaving your boundary. Book a conversation with the team.",
  alternates: { canonical: "/enterprise" },
};

export default function EnterprisePage() {
  return (
    <PageShell bleed>
      <SubPageHero
        eyebrow="Enterprise"
        crumb="Enterprise"
        title={
          <>
            AI your security team can <span className="aurora-text">actually sign off on</span>.
          </>
        }
        lede={
          <>
            Run autonomous intelligence across your organisation on infrastructure you own — governed
            by default, with a signed, verifiable receipt for every action and no data leaving your
            boundary. Bring your own models and your own keys. Let&apos;s talk through your environment.
          </>
        }
        facts={[
          { k: "Deployment", v: "Your infrastructure" },
          { k: "Data", v: "Stays in your boundary" },
          { k: "Every action", v: "Signed receipt" },
          { k: "Models", v: "Bring your own" },
        ]}
      />

      <DeepSection
        index="01"
        kicker="Why teams choose it"
        title="Autonomy you can govern, prove, and own"
        lede="The same architecture the homepage describes — applied to an organisation. Authority gates, audit trails, and verifiable receipts are the default, not an add-on."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <DeepCard icon={Server} title="Owned, not rented">
            Run on hardware and clouds you control. No vendor sits between your agents and your data.
          </DeepCard>
          <DeepCard icon={ShieldCheck} title="Governed by default">
            Capability and authority gates, human-approval steps, and deny-by-default policies bound every action.
          </DeepCard>
          <DeepCard icon={FileCheck2} title="Provable, not assumed">
            Every action leaves a signed, hash-chained receipt your team can verify independently.
          </DeepCard>
          <DeepCard icon={Lock} title="Your keys, your models">
            Bring your own model accounts and keys; they stay sealed on your infrastructure.
          </DeepCard>
          <DeepCard icon={Users} title="Built for teams">
            Roles, shared governance, and per-node identity so you always know who acted, under whose authority.
          </DeepCard>
          <DeepCard icon={Gauge} title="Readiness, measured">
            See how ready your stack is to be trusted with autonomy — measured, with the gaps shown honestly.
          </DeepCard>
        </div>
      </DeepSection>

      <DeepSection
        id="schedule"
        index="02"
        kicker="Talk to the team"
        title="Schedule a conversation"
        lede="Pick a time that works for you. We'll walk through your environment, your governance requirements, and how a sovereign deployment would fit — no pressure, no script."
      >
        <CalEmbed />
        <p className="mono mt-4 text-[12px] text-[color:var(--color-ink-faint)]">
          Prefer email? Reach us at{" "}
          <a href="mailto:enterprise@efficientlabs.ai" className="link-cta">enterprise@efficientlabs.ai</a>.
        </p>
      </DeepSection>

      <SubPageCTA
        kicker="Start anywhere"
        title={<>You don&apos;t have to wait for a call to begin.</>}
        body="Score your current setup and install free, today — then bring the team on when you're ready."
        primary={{ label: "Run your readiness assessment", href: "/score" }}
        secondary={{ label: "Install free", href: "/start" }}
      />
    </PageShell>
  );
}
