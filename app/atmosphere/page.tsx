import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import AtmosphereReveal from "@/components/acts/AtmosphereReveal";
import Differentiators from "@/components/Differentiators";

export const metadata: Metadata = {
  title: "The Atmosphere",
  description:
    "The sovereign mesh for AI agents. Content-addressed, capability-secured, post-quantum — peer-to-peer with no open ports. No central server can seize, censor, or surveil it.",
  alternates: { canonical: "/atmosphere" },
};

export default function AtmospherePage() {
  // Both children render their own full-width sections (AtmosphereReveal is a
  // pinned full-bleed canvas), so skip the container constraint.
  return (
    <PageShell bleed>
      <AtmosphereReveal />
      <Differentiators />
    </PageShell>
  );
}
