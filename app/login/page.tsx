import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in — Efficient Labs",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <main className="relative"><AuthForm mode="login" /></main>;
}
