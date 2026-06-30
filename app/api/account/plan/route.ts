import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { billingUrl, OWNER_AUTH_COOKIE } from "@/lib/billing-api";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const target = billingUrl("billing/account/plan");
  if (!target) {
    return NextResponse.json({ error: "billing API not configured" }, { status: 503 });
  }

  const headers = new Headers({ accept: "application/json" });
  const authorization = req.headers.get("authorization");
  const sessionToken = (await cookies()).get(OWNER_AUTH_COOKIE)?.value;
  if (authorization) {
    headers.set("authorization", authorization);
  } else if (sessionToken) {
    headers.set("authorization", `Bearer ${sessionToken}`);
  }

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
