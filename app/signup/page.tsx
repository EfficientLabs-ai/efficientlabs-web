import type { Metadata } from "next";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account — Efficient Labs",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <main className="relative">
      <AuthForm mode="signup" />
      {/* sovereign path preserved: no account pressure before pairing (onboarding spec §5) */}
      <p className="mono pb-10 text-center text-[11px] text-[color:var(--color-ink-faint)]">
        No account yet?{" "}
        <Link href="/start" className="link-cta">Start without one</Link> — only pairing needs it.
      </p>
    </main>
  );
}
