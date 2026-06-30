import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const billingApiBase = process.env.BILLING_API_BASE_URL;

function billingUrl(path: string): string | null {
  if (!billingApiBase) return null;
  return new URL(path, billingApiBase.endsWith("/") ? billingApiBase : `${billingApiBase}/`).toString();
}

export async function GET(req: Request) {
  const target = billingUrl("billing/account/plan");
  if (!target) {
    return NextResponse.json({ error: "billing API not configured" }, { status: 503 });
  }

  const headers = new Headers({ accept: "application/json" });
  const authorization = req.headers.get("authorization");
  if (authorization) headers.set("authorization", authorization);

  try {
    const res = await fetch(target, {
      cache: "no-store",
      headers,
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") ?? "application/json",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "billing API unavailable" }, { status: 503 });
  }
}
