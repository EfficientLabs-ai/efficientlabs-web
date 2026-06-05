import type { Metadata } from "next";
import PageShell from "@/components/PageShell";
import StratosAgent from "@/components/StratosAgent";
import SovereignPath from "@/components/SovereignPath";

export const metadata: Metadata = {
  title: "StratosAgent",
  description:
    "The agent that runs on hardware you own. Local-first by default — prompts resolve on your machine; the frontier cloud is opt-in only. Reachable on Telegram, Discord, Slack, Matrix, and Signal.",
  alternates: { canonical: "/stratos" },
};

export default function StratosPage() {
  // StratosAgent renders its own full-bleed section; SovereignPath is bare
  // content, so give it the standard section + container wrapper here.
  return (
    <PageShell bleed>
      <StratosAgent />
      <section id="routing" className="section section-t scroll-mt-20">
        <div className="container-x">
          <SovereignPath />
        </div>
      </section>
    </PageShell>
  );
}
