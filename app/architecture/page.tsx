import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Architecture from "@/components/Architecture";

export const metadata: Metadata = {
  title: "Architecture",
  description:
    "The thesis: automate the file architecture, not the AI wrapper. A correctly-designed file and dataflow architecture does the work deterministically, cheaply, and auditably — the agent earns its place only where genuine ambiguity lives.",
  alternates: { canonical: "/architecture" },
};

export default function ArchitecturePage() {
  // Architecture renders its own full-width section + container.
  return (
    <PageShell bleed>
      <Architecture />
    </PageShell>
  );
}
