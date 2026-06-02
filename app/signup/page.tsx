import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account — Efficient Labs" };

export default function SignupPage() {
  return <main className="relative"><AuthForm mode="signup" /></main>;
}
