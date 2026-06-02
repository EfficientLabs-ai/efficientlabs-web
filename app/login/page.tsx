import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign in — Efficient Labs" };

export default function LoginPage() {
  return <main className="relative"><AuthForm mode="login" /></main>;
}
