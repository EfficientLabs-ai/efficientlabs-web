import { NextResponse } from "next/server";
import { billingUrl, OWNER_AUTH_COOKIE, sessionCookieMaxAge } from "@/lib/billing-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function POST(req: Request) {
  const target = billingUrl("auth/signup");
  if (!target) {
    return NextResponse.json({ error: "auth API not configured" }, { status: 503 });
  }

  const upstream = await fetch(target, {
    method: "POST",
    cache: "no-store",
    headers: { "content-type": "application/json" },
    body: await req.text(),
  });
  const body = await readJson(upstream) as {
    email?: string;
    error?: string;
    expiresIn?: number;
    token?: string;
  };

  if (!upstream.ok || !body.token || !body.email) {
    return NextResponse.json(
      { error: body.error || "signup failed" },
      { status: upstream.ok ? 502 : upstream.status },
    );
  }

  const response = NextResponse.json(
    { signedIn: true, email: body.email },
    { status: 201 },
  );
  response.cookies.set(OWNER_AUTH_COOKIE, body.token, {
    httpOnly: true,
    maxAge: sessionCookieMaxAge(body.expiresIn),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
