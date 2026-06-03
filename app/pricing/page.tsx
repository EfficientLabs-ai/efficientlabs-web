import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Pricing from "@/components/Pricing";

export const metadata: Metadata = {
  title: "Pricing — Efficient Labs",
  description: "Flat pricing for sovereign, local-first AI infrastructure. No metering, no egress fees, no lock-in.",
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
