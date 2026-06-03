import { NextResponse, type NextRequest } from "next/server";
import { passwordOk, mintSession, OPS_COOKIE } from "@/lib/ops-auth";

// POST-only login: password arrives in the form body (never a URL), is checked
// constant-time, and on success an opaque HMAC-signed session cookie is set.
export async function POST(req: NextRequest) {
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
