import { NextResponse } from "next/server";
import { OWNER_AUTH_COOKIE } from "@/lib/billing-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ signedIn: false });
  response.cookies.delete(OWNER_AUTH_COOKIE);
  return response;
}
