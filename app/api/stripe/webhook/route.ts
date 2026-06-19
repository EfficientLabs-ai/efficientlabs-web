import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { planForPriceId, type PlanSlug } from "@/lib/plans";

// Stripe needs the raw body + the Node runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const whSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Upsert the buyer's plan keyed by email (the address they checked out with,
// which should match their account email). Writes go through the service-role
// client, which bypasses RLS. Returns true ONLY when a row was actually written
// — the caller treats a false return as a fulfillment failure (fail-closed).
async function setPlan(
  email: string | null | undefined,
  plan: PlanSlug,
  customerId: string | null,
  status: string | null,
): Promise<boolean> {
  if (!email || !supabaseAdmin) return false;
  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      email: email.toLowerCase(),
      plan,
      status,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
  if (error) {
    // Loud — a paid customer's plan failed to persist. Surfaces for alerting.
    console.error("[stripe] subscriptions upsert FAILED", {
      email: email.toLowerCase(),
      plan,
      status,
      code: error.code,
      message: error.message,
    });
    return false;
  }
  return true;
}

async function emailForCustomer(customerId: string): Promise<string | null> {
  if (!stripe) return null;
  const cust = await stripe.customers.retrieve(customerId);
  if (cust.deleted) return null;
  return cust.email ?? null;
}

export async function POST(req: Request) {
  // FAIL-CLOSED: the website fulfillment path is unconfigured. We do NOT 200
  // here — a 200 tells Stripe "delivered" and the event is dropped forever, so a
  // paid customer is silently never provisioned. Return 503 so Stripe retries
  // (with backoff) and the failure shows up in the Stripe dashboard / alerting.
  if (!stripe || !whSecret || !supabaseAdmin) {
    console.error("[stripe] webhook received but fulfillment is UNCONFIGURED", {
      hasStripe: !!stripe,
      hasWebhookSecret: !!whSecret,
      hasSupabaseAdmin: !!supabaseAdmin,
    });
    return NextResponse.json(
      { error: "fulfillment not configured" },
      { status: 503 },
    );
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  // Signature verification stays first — an unsigned/forged body is a hard 400
  // (do NOT retry; it will never be valid).
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", whSecret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const email = s.customer_details?.email ?? s.customer_email ?? null;
        const customerId = typeof s.customer === "string" ? s.customer : s.customer?.id ?? null;

        let plan: PlanSlug | null = null;
        if (s.subscription) {
          const subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          plan = planForPriceId(sub.items.data[0]?.price.id);
        } else {
          const items = await stripe.checkout.sessions.listLineItems(s.id, { limit: 1 });
          plan = planForPriceId(items.data[0]?.price?.id);
        }

        // A completed checkout we cannot provision must be LOUD and FAIL-CLOSED —
        // the customer was charged. We return 5xx (not 200) so Stripe retries and
        // the failure is visible for reconciliation/alerting (the top "silent
        // plan=null" launch risk). Either the price id isn't in the env map, or we
        // couldn't read the buyer's email.
        if (!plan || !email) {
          console.error("[stripe] checkout.session.completed NOT provisioned", {
            sessionId: s.id,
            customerId,
            hasEmail: !!email,
            plan: plan ?? "null (price id not in STRIPE_PRICE_* map)",
          });
          return NextResponse.json(
            { error: "checkout not provisionable" },
            { status: 422 },
          );
        }

        const written = await setPlan(email, plan, customerId, "active");
        if (!written) {
          // setPlan already logged loudly. Fail-closed so Stripe retries.
          return NextResponse.json({ error: "fulfillment write failed" }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await emailForCustomer(sub.customer as string);
        const active = sub.status === "active" || sub.status === "trialing";
        const plan = active ? planForPriceId(sub.items.data[0]?.price.id) ?? "free" : "free";
        const written = await setPlan(email, plan, sub.customer as string, sub.status);
        if (!written) {
          console.error("[stripe] customer.subscription.updated NOT persisted", {
            customerId: sub.customer,
            hasEmail: !!email,
            plan,
            status: sub.status,
          });
          return NextResponse.json({ error: "fulfillment write failed" }, { status: 500 });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await emailForCustomer(sub.customer as string);
        const written = await setPlan(email, "free", sub.customer as string, "canceled");
        if (!written) {
          console.error("[stripe] customer.subscription.deleted NOT persisted", {
            customerId: sub.customer,
            hasEmail: !!email,
          });
          return NextResponse.json({ error: "fulfillment write failed" }, { status: 500 });
        }
        break;
      }
    }
  } catch (err) {
    // Let Stripe retry transient failures (network, Stripe API hiccup, etc.).
    console.error("[stripe] webhook handler error", {
      type: event.type,
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  // Only a row that was actually written reaches here → safe to acknowledge.
  return NextResponse.json({ received: true });
}
