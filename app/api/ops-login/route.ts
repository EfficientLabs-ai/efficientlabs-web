import { NextResponse, type NextRequest } from "next/server";
import { passwordOk, mintSession, OPS_COOKIE } from "@/lib/ops-auth";
import { rateLimit } from "@/lib/rate-limit";

// POST-only login: password arrives in the form body (never a URL), is checked
// constant-time, and on success an opaque HMAC-signed session cookie is set.
export async function POST(req: NextRequest) {
  // Throttle credential-stuffing: 5 attempts / minute / IP (fail-open, per-instance).
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`ops-login:${ip}`, 5, 60_000).ok) {
    return NextResponse.redirect(new URL("/ops/login?e=rate", req.url), { status: 303 });
  }
  const form = await req.formData();
  const password = String(form.get("password") || "");
  if (!passwordOk(password)) {
    return NextResponse.redirect(new URL("/ops/login?e=1", req.url), { status: 303 });
  }
  const res = NextResponse.redirect(new URL("/ops", req.url), { status: 303 });
  res.cookies.set(OPS_COOKIE, mintSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}
