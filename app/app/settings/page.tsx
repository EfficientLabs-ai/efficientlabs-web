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
import { signOut } from "@/lib/auth-client";
import { useOs } from "@/components/os/useOsSession";
import { PLAN_LABEL } from "@/lib/plans";
import { useOsPrefs } from "@/components/os/useOsPrefs";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import ConnectRow from "@/components/os/ConnectRow";
import ComingSoon from "@/components/os/ComingSoon";
import CustomizePanel from "@/components/os/CustomizePanel";
import AdvancedControls from "@/components/os/AdvancedControls";

// Model sources — your own AI accounts; keys are sealed locally and never leave the machine.
const KEY_PROVIDERS = [
  { icon: KeyRound, name: "OpenAI", detail: "Sealed locally — never leaves your machine" },
  { icon: KeyRound, name: "Anthropic", detail: "Sealed locally — never leaves your machine" },
  { icon: Server, name: "Local model", detail: "Runs on hardware you own — no key needed" },
];

// Channel adapters are daemon-started but config-needed per status.json. The UI shows
// them as honest connect targets; nothing is shown as connected until it is.
const CHANNELS = [
  { name: "Telegram", detail: "Bot adapter, daemon-started" },
  { name: "Discord", detail: "Bot adapter, daemon-started" },
  { name: "Slack", detail: "App adapter, daemon-started" },
  { name: "Matrix", detail: "Client adapter, daemon-started" },
  { name: "Signal", detail: "Linked-device adapter, daemon-started" },
];

export default function SettingsPage() {
  const { email, signedIn, plan } = useOs();
  const { prefs } = useOsPrefs();

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Settings"
        title={
          <>
            Customize &amp; <span className="aurora-text">account</span>
          </>
        }
        description="Tune the OS to your liking — theme, accent, density, and your Home layout — then manage account, your AI provider keys, channels, and owner controls. Customization is client-side and persisted to your browser; nothing is shown as connected until it really is."
      />

      {/* Customize — the customization hub. All client-side + persisted. */}
      <section id="customize" className="scroll-mt-20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Customize</h2>
          <span className="mono text-[11px] text-[color:var(--color-ink-faint)]">
            Saved to this browser
          </span>
        </div>
        <OsCard variant="data">
          <CustomizePanel />
        </OsCard>
      </section>

      {/* Advanced controls — only when Advanced mode is on (set above). */}
      {prefs.advanced && (
        <section className="space-y-4">
          <OsCard variant="data">
            <AdvancedControls signedIn={signedIn} />
          </OsCard>
        </section>
      )}

      {/* Account */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Account</h2>
        <OsCard icon={Users} title="Account" variant="data">
          <div className="space-y-2">
            <p className="mono text-[12px] text-[color:var(--color-ink-dim)]">
              {signedIn ? email : "Not signed in"}
            </p>
            <p className="mono text-[11px] text-[color:var(--color-ink-faint)]">{PLAN_LABEL[plan]}</p>
            {signedIn ? (
              <button
                onClick={() => void signOut()}
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

      {/* Model sources (your own AI accounts) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
            Model sources (your own AI accounts)
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
          <CapStatus name="Cost gate (your own AI accounts)" />
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
          One agent, every inbox. Channel adapters are started by the daemon, but they need owner
          tokens and send/receive verification before they count as live.
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
          <CapStatus name="Channel adapters" />
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
          <OsCard icon={KeyRound} title="Cost gate (your own AI accounts)" statusLevel="live" variant="data">
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
            You are on {PLAN_LABEL[plan]}.{" "}
            {plan === "free"
              ? "Upgrade to pool more devices and unlock the full skill library on the pricing page."
              : "Manage your plan and seats on the pricing page."}
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
