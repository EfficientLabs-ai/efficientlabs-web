import type { Metadata } from "next";
import LegalDoc from "@/components/pages/LegalDoc";

export const metadata: Metadata = {
  title: "Security — Efficient Labs",
  description:
    "How Efficient Labs is secured: local-first by design, content-addressed and post-quantum-sealed data, signed receipts, and deny-by-default governance.",
  alternates: { canonical: "/security" },
};

export default function SecurityPage() {
  return (
    <LegalDoc
      title="Security"
      updated="June 17, 2026"
      intro="Security isn't a feature bolted on at the end — it's the architecture. The less data leaves your control, the less there is to breach."
    >
      <h2>Local-first by design</h2>
      <p>
        Your prompts, keys, files, and agent memory are processed on infrastructure you own. The smallest
        possible footprint reaches us, which shrinks the attack surface from the start.
      </p>

      <h2>Verifiable, not assumed</h2>
      <ul>
        <li><strong>Content-addressed data.</strong> Payloads are addressed by the hash of their contents, so tampering is detectable.</li>
        <li><strong>Post-quantum sealing.</strong> Data exchanged across the mesh is sealed with post-quantum signatures.</li>
        <li><strong>Signed receipts.</strong> Every governed action leaves a hash-chained receipt you can verify independently.</li>
        <li><strong>Deny-by-default governance.</strong> Capability and authority gates bound every action; denials are audited.</li>
      </ul>

      <h2>Your keys stay yours</h2>
      <p>
        Model and provider keys are sealed locally and used through your own accounts. They are not stored
        on, or proxied through, our servers.
      </p>

      <h2>Responsible disclosure</h2>
      <p>
        Found a vulnerability? We want to hear from you. Email{" "}
        <a href="mailto:security@efficientlabs.ai" className="link-cta">security@efficientlabs.ai</a>{" "}
        with details and steps to reproduce. Please give us a reasonable window to remediate before any
        public disclosure; we will keep you updated on our progress.
      </p>

      <h2>Questions</h2>
      <p>
        For security questions about an enterprise deployment, reach us at{" "}
        <a href="mailto:security@efficientlabs.ai" className="link-cta">security@efficientlabs.ai</a>.
      </p>
    </LegalDoc>
  );
}
