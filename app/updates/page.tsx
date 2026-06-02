import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Updates from "@/components/Updates";

export const metadata: Metadata = {
  title: "Updates — Efficient Labs",
  description: "What's shipped on The Atmosphere — every capability the moment it goes live.",
};

export default function UpdatesPage() {
  return (
    <main className="relative">
      <Nav />
      <Updates />
      <Footer />
    </main>
  );
}
