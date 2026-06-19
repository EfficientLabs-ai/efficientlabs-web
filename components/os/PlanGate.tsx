"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { Lock, Sparkles } from "lucide-react";
import { useOs } from "@/components/os/useOsSession";
import { PLAN_LABEL, planMeets, requiredPlanFor, type Feature, type PlanSlug } from "@/lib/plans";

/**
 * Plan gating for the OS. One policy (lib/plans ENTITLEMENTS), three surfaces:
 *  - usePlanGate(required) — the boolean, reused everywhere.
 *  - <PlanWall required> — full-bleed upgrade screen (module-level gate, shell).
 *  - <PlanGate feature> — inline: blurs the feature behind a lock + upgrade CTA.
 *
 * Gating only bites a SIGNED-IN user whose plan is below the requirement. Signed
 * out → the shell already shows the preview, so we never double-wall.
 */
export function usePlanGate(required: PlanSlug) {
  const { plan, signedIn, ready } = useOs();
  const locked = ready && signedIn && !planMeets(plan, required);
  return { locked, plan, required };
}

function UpgradeCard({ required, note }: { required: PlanSlug; note?: ReactNode }) {
  return (
    <div className="glass max-w-sm rounded-[var(--radius)] p-6 text-center">
      <span className="mx-auto grid h-11 w-11 place-items-center rounded-full text-[color:var(--color-signal)]" style={{ background: "color-mix(in oklab, var(--color-signal) 12%, transparent)" }}>
        <Lock size={18} aria-hidden />
      </span>
      <p className="mono mt-4 text-[11px] uppercase tracking-[0.16em] text-[color:var(--color-signal)]">
        {PLAN_LABEL[required]}
      </p>
      <p className="mt-2 text-[14px] leading-relaxed text-[color:var(--color-ink-dim)]">
        {note ?? <>This is part of {PLAN_LABEL[required]}. Upgrade to unlock it.</>}
      </p>
      <Link href="/pricing" className="btn-signal mt-5 !px-4 !py-2 text-[13px]">
        Upgrade<span aria-hidden>→</span>
      </Link>
    </div>
  );
}

/** Module-level upgrade screen — rendered by the shell instead of the module. */
export function PlanWall({ required, module }: { required: PlanSlug; module?: string }) {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="flex flex-col items-center">
        <Sparkles size={22} className="mb-4 text-[color:var(--color-signal)]" aria-hidden />
        <UpgradeCard
          required={required}
          note={
            <>
              {module ? `${module} is` : "This module is"} part of {PLAN_LABEL[required]}.
              Upgrade to bring it online.
            </>
          }
        />
      </div>
    </div>
  );
}

/** Inline feature gate: blurs the feature behind a lock + upgrade CTA. */
export default function PlanGate({ feature, children, note }: { feature: Feature; children: ReactNode; note?: ReactNode }) {
  const required = requiredPlanFor(feature);
  const { locked } = usePlanGate(required);
  if (!locked) return <>{children}</>;
  return (
    <div className="relative">
      <div aria-hidden className="pointer-events-none select-none opacity-50 blur-[3px]">
        {children}
      </div>
      <div className="absolute inset-0 grid place-items-center p-4">
        <UpgradeCard required={required} note={note} />
      </div>
    </div>
  );
}
