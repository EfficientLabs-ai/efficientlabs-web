"use client";
// ── POST-CHECKOUT WELCOME — the relief beat after payment ─────────────────────
// Stripe `success_url` lands the buyer here. We confirm the purchase, surface the
// plan when the success_url passes a `?plan=` hint, and hand them into the two
// real next doors: pair a node (/install) and open the control plane (/app).
// Provisioning itself is keyed to the checkout email by the Stripe webhook, so
// this page never asserts entitlement it can't verify client-side — it confirms
// and routes. `?session_id=` is accepted but optional; absent it, nothing breaks.
// Motion uses lib/motion.ts via <Reveal>; reduced-motion = clean static base.
import { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, TerminalSquare, LayoutGrid, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { PLAN_LABEL, type PlanSlug } from "@/lib/plans";
import { track } from "@/lib/analytics";

const PLAN_KEYS = Object.keys(PLAN_LABEL) as PlanSlug[];

function isPlanSlug(v: string | null): v is PlanSlug {
  return !!v && (PLAN_KEYS as string[]).includes(v);
}

export default function WelcomeConfirmation() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const planParam = params.get("plan");
  const plan: PlanSlug | null = isPlanSlug(planParam) ? planParam : null;
  const planLabel = plan ? PLAN_LABEL[plan] : null;

  // One activation event, regardless of whether a session_id/plan was passed.
  useEffect(() => {
    track("checkout_activated", {
      hasSession: !!sessionId,
      plan: plan ?? null,
    });
    // session/plan are stable for the life of this page render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative overflow-hidden pb-24">
      {/* destination glow — signals "you've arrived", not "scroll on" */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-[-6rem] h-[30rem] w-[46rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[130px]"
          style={{ background: "radial-gradient(circle, var(--color-signal), transparent 62%)" }}
        />
      </div>

      <div className="relative mx-auto max-w-3xl">
        <Reveal>
          <div className="inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.08] px-3.5 py-1.5">
            <CheckCircle2 size={15} className="text-[color:var(--color-signal)]" aria-hidden />
            <span className="mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-signal)]">
              Purchase confirmed
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="t-display-sm mt-7">
            Welcome to the <span className="aurora-text">Atmosphere</span>.
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="t-body-lg mt-6 max-w-2xl text-[color:var(--color-ink-dim)]">
            {planLabel ? (
              <>
                Your <span className="text-[color:var(--color-ink)]">{planLabel}</span>{" "}plan is on its way to
                your account. Activation is keyed to the email you checked out with — confirm that inbox if you
                haven&apos;t yet, then bring your first node online below.
              </>
            ) : (
              <>
                Thank you. Activation is keyed to the email you checked out with — confirm that inbox if you
                haven&apos;t yet, then bring your first node online below. Your plan appears in your control
                plane once the account email is confirmed.
              </>
            )}
          </p>
        </Reveal>

        {/* the two real next doors — pair a node, then drive it */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Reveal delay={0.18}>
            <Link
              href="/install"
              onClick={() => track("cta_click", { location: "welcome", cta: "Pair a node", href: "/install" })}
              className="lm-card is-interactive group flex h-full flex-col p-6"
            >
              <div className="glass grid h-10 w-10 place-items-center rounded-xl text-[color:var(--color-signal)]">
                <TerminalSquare size={18} aria-hidden />
              </div>
              <h2 className="mt-4 text-[15px] font-semibold text-[color:var(--color-ink)]">Pair your first node</h2>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
                Two commands bring a device online and into your private mesh. Start here — this is what
                you just bought.
              </p>
              <span className="mono mt-4 inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-faint)] transition-colors group-hover:text-[color:var(--color-signal)]">
                Install &amp; pair
                <ArrowRight size={12} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-[3px]" />
              </span>
            </Link>
          </Reveal>

          <Reveal delay={0.24}>
            <Link
              href="/app"
              onClick={() => track("cta_click", { location: "welcome", cta: "Open control plane", href: "/app" })}
              className="lm-card is-interactive group flex h-full flex-col p-6"
            >
              <div className="glass grid h-10 w-10 place-items-center rounded-xl text-[color:var(--color-signal)]">
                <LayoutGrid size={18} aria-hidden />
              </div>
              <h2 className="mt-4 text-[15px] font-semibold text-[color:var(--color-ink)]">Open your control plane</h2>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-[color:var(--color-ink-dim)]">
                Your agent, mesh, model keys, and channels — one place to manage everything once a node
                is paired.
              </p>
              <span className="mono mt-4 inline-flex items-center gap-1.5 text-[11px] text-[color:var(--color-ink-faint)] transition-colors group-hover:text-[color:var(--color-signal)]">
                Go to /app
                <ArrowRight size={12} aria-hidden className="transition-transform duration-150 ease-out group-hover:translate-x-[3px]" />
              </span>
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.3}>
          <p className="mono mt-10 text-[11px] leading-relaxed text-[color:var(--color-ink-faint)]">
            Need a hand?{" "}
            <a href="mailto:hello@efficientlabs.ai?subject=Getting%20started" className="link-cta">
              hello@efficientlabs.ai
            </a>
            {sessionId ? <> · ref {sessionId.slice(0, 14)}…</> : null}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
