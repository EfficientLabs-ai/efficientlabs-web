import type { Metadata } from "next";
import OsShell from "@/components/os/OsShell";

// /app is the customer surface (Atmosphere OS). Like /dashboard it is a private
// control plane: this server layout carries the hard noindex, then hands off to
// the client OsShell which owns auth + navigation.
export const metadata: Metadata = {
  title: "Atmosphere OS — Efficient Labs",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <OsShell>{children}</OsShell>;
}
