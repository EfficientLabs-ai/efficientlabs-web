import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import Install from "@/components/Install";

export const metadata: Metadata = {
  title: "Install",
  description:
    "Run it on your own metal. Install the Atmosphere runtime and bring StratosAgent online on hardware you own — no open ports, post-quantum keys sealed, meshed peer-to-peer.",
  alternates: { canonical: "/install" },
};

export default function InstallPage() {
  // Install renders its own full-width section + container.
  return (
    <PageShell bleed>
      <Install />
    </PageShell>
  );
}
