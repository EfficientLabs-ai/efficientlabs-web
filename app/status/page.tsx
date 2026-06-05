import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import StatusMatrix from "@/components/acts/StatusMatrix";

export const metadata: Metadata = {
  title: "Status",
  description:
    "What's real and what's not yet. Every capability is labelled Live, Wired, Standalone, or Mock — if it isn't real yet, it says so. Honesty is the only durable moat.",
  alternates: { canonical: "/status" },
};

export default function StatusPage() {
  // StatusMatrix returns bare content; PageShell's default container wraps it.
  return (
    <PageShell>
      <section className="section scroll-mt-20">
        <StatusMatrix />
      </section>
    </PageShell>
  );
}
