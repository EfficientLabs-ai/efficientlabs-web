"use client";
import Link from "next/link";
import { Wallet, Fingerprint, ShieldCheck, FileText, Scale } from "lucide-react";
import { CapStatus } from "@/components/docs/StatusBadge";
import { useOs } from "@/components/os/useOsSession";
import ModuleHeader from "@/components/os/ModuleHeader";
import OsCard from "@/components/os/OsCard";
import StatusChip from "@/components/os/StatusChip";
import EmptyState from "@/components/os/EmptyState";

/**
 * Wallet — reserve a contributor identity by connecting a Solana wallet.
 *
 * Honesty discipline (HARD): no figures anywhere — no token amounts, no
 * currency, no holdings, no rate/return numbers, no valuation. Connecting is
 * sign-to-prove only: we read the PUBLIC address, never custody funds, and
 * nothing is broadcast on-chain. The wallet is optional.
 */
export default function WalletPage() {
  const { signedIn } = useOs();
  const locked = !signedIn;

  return (
    <div className="space-y-8">
      <ModuleHeader
        kicker="Wallet"
        title={
          <>
            Contributor <span className="aurora-text">identity</span>
          </>
        }
        actions={locked ? <StatusChip tone="preview" /> : undefined}
        description="Connect your wallet to reserve your Atmosphere contributor identity and track eligible Contribution Credits before rewards go live."
      />

      {/* Connect wallet — sign-to-prove, public address only, no custody */}
      <OsCard
        icon={Wallet}
        title="Connect Solana wallet"
        variant="lm"
        locked={locked}
        footer={
          !locked ? (
            <button className="btn-signal !px-4 !py-2 text-[12px]">
              Connect wallet
              <span aria-hidden>→</span>
            </button>
          ) : undefined
        }
      >
        Connect your wallet to reserve your Atmosphere contributor identity and track
        eligible Contribution Credits before rewards go live. Connecting is optional and
        sign-to-prove only — we read your public address to bind your contributor identity,
        never take custody of funds, and nothing is broadcast on-chain.
      </OsCard>

      {/* What connecting does / does not do */}
      <div className="grid gap-4 lg:grid-cols-3">
        <OsCard icon={Fingerprint} title="Contributor identity" variant="data">
          A stable identity that ties your contribution back to you when rewards eventually
          go live. Reserve it once; nothing else is required.
        </OsCard>
        <OsCard icon={ShieldCheck} title="No custody" statusLevel="live" variant="data">
          Sign-to-prove reads your public address only. We never hold your keys, never move
          funds, and the secret-guard scrubs any secret-shaped string before it leaves your
          machine.
        </OsCard>
        <OsCard icon={Wallet} title="On-chain settlement" statusLevel="mock" variant="data">
          Offline-signed, never broadcast. Settlement is a scaffold — there is no production
          payout path today, and no figures are shown.
        </OsCard>
      </div>

      {/* Contribution account — honest empty until a wallet is connected */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Contribution account
        </h2>
        <EmptyState
          icon={Fingerprint}
          title={locked ? "Sign in to reserve your contributor identity" : "No wallet connected"}
          description="Connect a wallet to reserve your contributor identity. Your eligible Contribution Credits and reward eligibility appear here once there is a real source — no amounts are shown before then."
          action={
            locked ? (
              <Link href="/login" className="btn-signal !px-4 !py-2 text-[12px]">
                Sign in →
              </Link>
            ) : (
              <Link href="/app/rewards" className="btn-outline !px-4 !py-2 text-[12px]">
                View contribution tracking →
              </Link>
            )
          }
        />
      </section>

      {/* Reward eligibility */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Reward eligibility
        </h2>
        <OsCard icon={ShieldCheck} title="Eligibility" variant="data">
          Reserving a contributor identity makes you eligible to have contribution tracked.
          Eligibility is not a promise of payment — there is no active payout path, and no
          amount, rate, or value is implied.
        </OsCard>
      </section>

      {/* Status */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">Status</h2>
        <div className="space-y-2.5">
          <CapStatus name="Economic / on-chain settlement" />
        </div>
        <p className="mono text-[12px] text-[color:var(--color-ink-faint)]">
          Contribution tracking active · Payouts not live
        </p>
      </section>

      {/* Legal / tax notice */}
      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold text-[color:var(--color-ink)]">
          Legal &amp; tax notice
        </h2>
        <div className="data-card flex flex-col gap-3 p-6">
          <div className="flex items-start gap-3">
            <Scale size={16} className="mt-0.5 shrink-0 text-[color:var(--color-ink-dim)]" />
            <p className="text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
              Contribution Credits are an internal tracking unit. They are not a security,
              not a currency, and carry no monetary value or guarantee of future value.
              Reserving a contributor identity is not an offer of payment and nothing here
              is financial, investment, or tax advice.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <FileText size={16} className="mt-0.5 shrink-0 text-[color:var(--color-ink-dim)]" />
            <p className="text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
              If rewards ever go live, any distribution may be subject to eligibility rules
              and the tax laws of your jurisdiction — you are responsible for your own tax
              reporting. Connecting a wallet is optional and does not transfer custody of any
              assets.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
