import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Efficient Labs",
  description:
    "Flat pricing for sovereign, local-first AI infrastructure — Free Forever, Exos Pro, Apex, Apex Max, Teams, and Enterprise. Pay for governed workflows, verifiable receipts, and continuity. No metering, no egress fees, no lock-in. Sovereignty is always free.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <main className="relative">
      <Nav />
      <Pricing />
      <Footer />
    </main>
  );
}
