import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { billingUrl, OWNER_AUTH_COOKIE } from "@/lib/billing-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function ownerAuthReady() {
  const healthUrl = billingUrl("health");
  if (!healthUrl) return false;
  try {
    const res = await fetch(healthUrl, { cache: "no-store" });
    const body = await readJson(res) as {
      authVerifier?: string;
      authVerifierProvider?: string | null;
    };
    return res.ok
      && body.authVerifier === "configured"
      && body.authVerifierProvider === "efficientlabs";
  } catch {
    return false;
  }
}

export async function GET() {
  const target = billingUrl("auth/session");
  const authReady = await ownerAuthReady();
  if (!target) {
    return NextResponse.json({ authReady: false, signedIn: false }, { status: 200 });
  }

  const token = (await cookies()).get(OWNER_AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authReady, signedIn: false }, { status: 200 });
  }

  const upstream = await fetch(target, {
    cache: "no-store",
    headers: { authorization: `Bearer ${token}` },
  });
  const body = await readJson(upstream) as {
    email?: string;
    error?: string;
    signedIn?: boolean;
  };

  if (!upstream.ok) {
    const response = NextResponse.json(
      { authReady, signedIn: false, error: body.error || "session expired" },
      { status: upstream.status === 401 ? 200 : upstream.status },
    );
    if (upstream.status === 401) response.cookies.delete(OWNER_AUTH_COOKIE);
    return response;
  }

  return NextResponse.json({
    authReady,
    signedIn: Boolean(body.signedIn && body.email),
    email: body.email || null,
  });
}
