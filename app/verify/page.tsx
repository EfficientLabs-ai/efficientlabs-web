import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/PageShell";
import SubPageHero from "@/components/pages/SubPageHero";
import DropBundleVerify from "@/components/proof/DropBundleVerify";

export const metadata: Metadata = {
  title: "Verify — check any receipt offline, in your browser",
  description:
    "Drop an Efficient Labs receipt bundle and verify it in your own browser: the full hash chain and both halves of the hybrid post-quantum signature, checked with the public key alone. The file never leaves this page. No account, no upload.",
  alternates: { canonical: "/verify" },
};

export default function VerifyPage() {
  return (
    <PageShell>
      <SubPageHero
        eyebrow="Verify"
        crumb="Verify"
        title={
          <>
            Don&apos;t trust it. <span className="aurora-text">Verify</span> it.
          </>
        }
        lede={
          <>
            Drop a receipt bundle below and your browser replays the full hash chain and both halves of
            the hybrid post-quantum signature — checked against the public key alone. The file never
            leaves this page: no upload, no account. This is the page you send a client when they ask
            you to prove what your AI did.
          </>
        }
        facts={[
          { k: "Runs", v: "In your browser" },
          { k: "Upload", v: "Never" },
          { k: "Key", v: "Public only" },
          { k: "Account", v: "None" },
          { k: "Works", v: "Offline" },
        ]}
      />

      {/* ── the local verifier — file never leaves the tab ── */}
      <section className="section scroll-mt-20 pt-0">
        <DropBundleVerify />
        <p className="mono mt-4 text-[11px] leading-relaxed text-[color:var(--color-ink-faint)]">
          No bundle handy? Watch a live one verify itself on the{" "}
          <Link href="/status" className="link-cta">public status page</Link>, or export your own with{" "}
          <span className="text-[color:var(--color-ink-dim)]">stratos receipt export</span>. The
          verifier source is public in the StratosAgent repo — check our math, then check ours.
        </p>
      </section>
    </PageShell>
  );
}
