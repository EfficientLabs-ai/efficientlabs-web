import type { Metadata } from "next";

// /dashboard is a client component and cannot export metadata itself.
// This server layout carries the hard noindex for the private control plane.
export const metadata: Metadata = {
  title: "Dashboard — Efficient Labs",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
