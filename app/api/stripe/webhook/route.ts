import { NextResponse } from "next/server";

// Stripe needs the raw body + the Node runtime (not edge). This route is only a
// stable public URL; fulfillment runs on the VPS billing API so Postgres stays
// loopback-only and never becomes a Vercel dependency.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const billingApiBase = process.env.BILLING_API_BASE_URL;

function billingUrl(path: string): string | null {
  if (!billingApiBase) return null;
  return new URL(path, billingApiBase.endsWith("/") ? billingApiBase : `${billingApiBase}/`).toString();
}

export async function POST(req: Request) {
  const target = billingUrl("billing/stripe/webhook");
  if (!target) {
    console.error("[stripe] webhook received but BILLING_API_BASE_URL is not configured");
    return NextResponse.json(
      { error: "fulfillment not configured" },
      { status: 503 },
    );
  }

  const body = await req.text();
  const headers = new Headers({ "content-type": "application/json" });
  const signature = req.headers.get("stripe-signature");
  if (signature) headers.set("stripe-signature", signature);

  try {
    const res = await fetch(target, {
      method: "POST",
      cache: "no-store",
      headers,
      body,
    });
    const responseBody = await res.text();
    return new NextResponse(responseBody, {
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
