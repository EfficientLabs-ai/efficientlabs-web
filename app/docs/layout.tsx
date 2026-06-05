import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DocsShell from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: { default: "Docs", template: "%s — Efficient Labs Docs" },
  description:
    "Documentation for StratosAgent and the Atmosphere — sovereign, local-first AI infrastructure. Honest status on every capability.",
  alternates: { canonical: "/docs" },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative">
      <Nav />
      {/* clear the fixed nav (h≈4rem) */}
      <div className="pt-16">
        <DocsShell>{children}</DocsShell>
      </div>
      <Footer />
    </main>
  );
}
