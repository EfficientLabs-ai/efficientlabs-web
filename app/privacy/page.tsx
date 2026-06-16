import type { Metadata } from "next";
import LegalDoc from "@/components/pages/LegalDoc";

export const metadata: Metadata = {
  title: "Privacy Policy — Efficient Labs",
  description:
    "How Efficient Labs handles your data. Our local-first architecture means most of what you do never leaves your own infrastructure.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated="June 17, 2026"
      intro="Efficient Labs builds local-first, sovereign infrastructure. The design goal is that we see as little of your data as possible — most of what you run stays on hardware you control and never reaches us."
    >
      <h2>What we collect</h2>
      <p>
        <strong>Account information.</strong> If you create an account, we store the email address and
        authentication details needed to sign you in and secure your account.
      </p>
      <p>
        <strong>What stays on your machine.</strong> Your prompts, model keys, files, agent memory, and
        the work your node performs are processed locally by default. Where the frontier cloud is used,
        it is reached through your own provider account under a key you supply — that traffic is between
        you and that provider, not us.
      </p>
      <p>
        <strong>Optional telemetry.</strong> Operational telemetry (such as readiness signals) is shared
        with us only when you explicitly opt in. Where something is not measured, our products say so.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To provide, secure, and support your account and the services you request.</li>
        <li>To operate paid plans and process payments through our payment processor.</li>
        <li>To improve the product, using aggregated or opt-in data only.</li>
      </ul>

      <h2>What we do not do</h2>
      <p>We do not sell your personal data. We do not use your private content to train models.</p>

      <h2>Sharing</h2>
      <p>
        We share data only with service providers that help us operate (for example, authentication,
        payment processing, and scheduling), under contracts that limit their use of it, and where
        required by law.
      </p>

      <h2>Your rights</h2>
      <p>
        You can request access to, correction of, or deletion of your account data, and you can export
        or delete your locally-held data yourself at any time. Contact us to exercise these rights.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy as the product evolves. Material changes will be reflected by the
        effective date above.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email{" "}
        <a href="mailto:privacy@efficientlabs.ai" className="link-cta">privacy@efficientlabs.ai</a>.
      </p>
    </LegalDoc>
  );
}
