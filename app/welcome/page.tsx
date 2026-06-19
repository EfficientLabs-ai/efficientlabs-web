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
      {/* useSearchParams needs a Suspense boundary in Next 16; the fallback is
          the same confirmation copy minus the session/plan detail, so no-JS and
          first-paint both read correctly. */}
      <Suspense fallback={<WelcomeConfirmation />}>
        <WelcomeConfirmation />
      </Suspense>
    </PageShell>
  );
}
