import type { Metadata } from "next";
import LegalDoc from "@/components/pages/LegalDoc";

export const metadata: Metadata = {
  title: "Terms of Service — Efficient Labs",
  description: "The terms that govern your use of Efficient Labs products and services.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated="June 17, 2026"
      intro="These terms govern your use of Efficient Labs' websites, software, and services. By using them, you agree to these terms."
    >
      <h2>The service</h2>
      <p>
        Efficient Labs provides sovereign, local-first AI infrastructure. A free tier is available, and
        paid plans add capacity and features. Open-source components are governed by their own licenses,
        which take precedence for that code.
      </p>

      <h2>Your account</h2>
      <p>
        You are responsible for keeping your credentials and your own model/provider keys secure, and for
        activity under your account. Tell us promptly if you suspect unauthorized access.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not use the services unlawfully, or to harm, infringe, or violate the rights of others.</li>
        <li>Do not attempt to break, overload, or circumvent the security of the services or other nodes.</li>
        <li>You are responsible for the agents you run and the actions you authorize them to take.</li>
      </ul>

      <h2>Payments</h2>
      <p>
        Paid plans are billed through our payment processor on the cycle shown at checkout. Except where
        required by law, payments are non-refundable. You can cancel future renewals at any time.
      </p>

      <h2>Disclaimers</h2>
      <p>
        The services are provided &ldquo;as is.&rdquo; To the maximum extent permitted by law, we
        disclaim implied warranties. Autonomous systems can make mistakes; you are responsible for the
        guardrails and approvals you configure.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Efficient Labs is not liable for indirect, incidental, or
        consequential damages, and our total liability is limited to the amount you paid us in the
        twelve months before the claim.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the State of Wyoming, USA, without regard to its
        conflict-of-laws rules.
      </p>

      <h2>Changes</h2>
      <p>We may update these terms; material changes are reflected by the effective date above.</p>

      <h2>Contact</h2>
      <p>
        Questions? Email{" "}
        <a href="mailto:legal@efficientlabs.ai" className="link-cta">legal@efficientlabs.ai</a>.
      </p>
    </LegalDoc>
  );
}
