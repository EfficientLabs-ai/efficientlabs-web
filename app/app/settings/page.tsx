"use client";
import Link from "next/link";
import {
  KeyRound,
  ShieldCheck,
  Lock,
  Users,
  MessageSquare,
  Cpu,
  Server,
} from "lucide-react";
import { CapStatus } from "@/components/docs/StatusBadge";
import { supabase } from "@/lib/supabase";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import ConnectRow from "@/components/os/ConnectRow";
import ComingSoon from "@/components/os/ComingSoon";

// BYOK model sources — keys are sealed locally and never leave the machine.
const KEY_PROVIDERS = [
  { icon: KeyRound, name: "OpenAI", detail: "Sealed locally — never leaves your machine" },
  { icon: KeyRound, name: "Anthropic", detail: "Sealed locally — never leaves your machine" },
  { icon: Server, name: "Local model", detail: "Runs on hardware you own — no key needed" },
];

// Five channel adapters are daemon-started (Live per status.json). The UI shows
// them as honest connect targets; nothing is shown as connected until it is.
const CHANNELS = [
  { name: "Telegram", detail: "Bot adapter, daemon-started" },
  { name: "Discord", detail: "Bot adapter, daemon-started" },
  { name: "Slack", detail: "App adapter, daemon-started" },
  { name: "Matrix", detail: "Client adapter, daemon-started" },
  { name: "Signal", detail: "Linked-device adapter, daemon-started" },
];

export default function SettingsPage() {
  const { email, signedIn } = useOs();

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Settings"
        title={
          <>
            Account &amp; <span className="aurora-text">keys</span>
          </>
        }
        description="Your account, BYOK model sources, channels, and owner controls. Keys are sealed locally, command authority fails closed, and nothing is shown as connected until it really is."
      />

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Account</h2>
        <OsCard icon={Users} title="Account" variant="data">
          <div className="space-y-2">
            <p className="mono text-[12px] text-[color:var(--color-ink-dim)]">
              {signedIn ? email : "Not signed in"}
            </p>
            <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">Sovereign · Free</p>
            {signedIn ? (
              <button
                onClick={() => supabase?.auth.signOut().then(() => location.reload())}
                className="btn-outline !px-4 !py-2 text-[12px]"
              >
                Sign out
              </button>
            ) : (
              <Link href="/login" className="btn-signal !px-4 !py-2 text-[12px]">
                Sign in
                <span aria-hidden>→</span>
              </Link>
            )}
          </div>
        </OsCard>
      </section>

      {/* Model sources (BYOK) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Model sources (BYOK)
          </h2>
          <KeyRound size={15} className="text-[color:var(--color-signal)]" />
        </div>
        <p className="text-[13px] text-[color:var(--color-ink-dim)]">
          Bring your own keys. They are sealed locally with AES-GCM and never leave your
          machine. Spend is gated before any request goes out — coding routes to your local
          model, complex work routes to the cloud through the cost gate.
        </p>
        <div className="space-y-2.5">
          {KEY_PROVIDERS.map((k) => (
            <ConnectRow
              key={k.name}
              icon={k.icon}
              name={k.name}
              detail={k.detail}
              state={signedIn ? "available" : "preview"}
              cta="Add key"
            />
          ))}
        </div>
        <div className="space-y-2.5">
          <CapStatus name="BYOK cost gate" />
          <CapStatus name="Local ⇄ cloud language routing" />
        </div>
      </section>

      {/* Channels */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Channels</h2>
          <MessageSquare size={15} className="text-[color:var(--color-signal)]" />
        </div>
        <p className="text-[13px] text-[color:var(--color-ink-dim)]">
          One agent, every inbox. Five channel adapters are started by the daemon. Connect
          the ones you use — nothing is shown as connected until you link it.
        </p>
        <div className="space-y-2.5">
          {CHANNELS.map((c) => (
            <ConnectRow
              key={c.name}
              icon={MessageSquare}
              name={c.name}
              detail={c.detail}
              state={signedIn ? "available" : "preview"}
              cta="Connect"
            />
          ))}
        </div>
        <div className="space-y-2.5">
          <CapStatus name="Five channel adapters" />
        </div>
      </section>

      {/* Policy & owner-gating */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Policy &amp; owner-gating
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          <OsCard icon={ShieldCheck} title="Owner-gating" statusLevel="live" variant="data">
            Command authority fails closed — no owner set means no authority at all. Only the
            owner can grant command rights.
          </OsCard>
          <OsCard icon={KeyRound} title="BYOK cost gate" statusLevel="live" variant="data">
            All spend flows through one gated route. Nothing else can spend on your behalf,
            and every outbound action passes the cost handshake first.
          </OsCard>
          <OsCard icon={Lock} title="Vault" statusLevel="live" variant="data">
            Secrets sealed at rest with AES-GCM; derived keys are zeroed after use.
          </OsCard>
        </div>
        <div className="space-y-2.5">
          <CapStatus name="Owner-gating (fail-closed)" />
          <CapStatus name="Write-approval (402 loop)" />
          <CapStatus name="Vault (AES-GCM, memory-wiped)" />
          <CapStatus name="Secret-guard on every adapter" />
        </div>
      </section>

      {/* Plan & team */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Plan &amp; team</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <OsCard icon={Cpu} title="Billing &amp; plan" variant="data" href="/pricing">
            You are on Sovereign (Free). Manage plans and pool more devices on the pricing
            page.
          </OsCard>
          <ComingSoon
            title="Team seats"
            description="Invite teammates into a shared sovereign workspace. Not built yet."
          />
        </div>
      </section>
    </div>
  );
}
