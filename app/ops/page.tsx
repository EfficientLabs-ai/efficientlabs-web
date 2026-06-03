import type { Metadata } from "next";
import OpsDashboard from "@/components/ops/OpsDashboard";

export const metadata: Metadata = {
  title: "Founder Ops — Efficient Labs",
  description: "Private founder operations dashboard.",
  robots: { index: false, follow: false },
};

// NOTE: founder-only. Move to ops.efficientlabs.ai + put behind founder auth
// (Supabase role gate / Vercel password protection) before any real data is wired.
export default function OpsPage() {
  return <div className="relative"><OpsDashboard /></div>;
}
