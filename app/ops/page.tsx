import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import OpsDashboard from "@/components/ops/OpsDashboard";
import { sessionOk, OPS_COOKIE } from "@/lib/ops-auth";

export const metadata: Metadata = {
  title: "Founder Ops — Efficient Labs",
  description: "Private founder operations dashboard.",
  robots: { index: false, follow: false },
};

// Server-side founder gate: verify the signed session cookie before rendering.
// Default-deny — redirects to the login form when there is no valid session.
export default async function OpsPage() {
  const token = (await cookies()).get(OPS_COOKIE)?.value;
  if (!sessionOk(token)) redirect("/ops/login");
  return <div className="relative"><OpsDashboard /></div>;
}
