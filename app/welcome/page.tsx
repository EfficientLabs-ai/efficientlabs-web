import type { Metadata } from "next";
import { Suspense } from "react";
import PageShell from "@/components/PageShell";
import WelcomeConfirmation from "@/components/onboarding/WelcomeConfirmation";

// Post-checkout transactional page (Stripe success_url lands here). Not a
// marketing surface and not indexable — keep it out of search.
export const metadata: Metadata = {
  title: "Welcome — your purchase is confirmed",
  description:
    "Your Efficient Labs purchase is confirmed. Pair your first sovereign node and open your control plane.",
  robots: { index: false, follow: false },
};

export default function WelcomePage() {
  return (
    <PageShell>
      {/* useSearchParams() requires a Suspense boundary in Next 16. The fallback
          must NOT itself read search params (or it bails out of prerender too),
          so it's a static placeholder — replaced the instant the client mounts. */}
      <Suspense fallback={<WelcomeFallback />}>
        <WelcomeConfirmation />
      </Suspense>
    </PageShell>
  );
}

// Static, search-param-free placeholder shown during hydration / prerender.
function WelcomeFallback() {
  return (
    <section className="relative overflow-hidden pb-24">
      <div className="relative mx-auto max-w-3xl">
        <div className="inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] border border-[color:var(--color-signal)]/30 bg-[color:var(--color-signal)]/[0.08] px-3.5 py-1.5">
          <span className="mono text-[11px] uppercase tracking-[0.18em] text-[color:var(--color-signal)]">
            Purchase confirmed
          </span>
        </div>
        <h1 className="t-display-sm mt-7">
          Welcome to the <span className="aurora-text">Atmosphere</span>.
        </h1>
        <p className="t-body-lg mt-6 max-w-2xl text-[color:var(--color-ink-dim)]">
          Thank you. Activation is keyed to the email you checked out with — confirm that inbox if you
          haven&apos;t yet, then bring your first node online.
        </p>
      </div>
    </section>
  );
}
