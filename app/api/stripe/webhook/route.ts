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
// client, which bypasses RLS.
async function setPlan(
  email: string | null | undefined,
  plan: PlanSlug,
  customerId: string | null,
  status: string | null,
) {
  if (!email || !supabaseAdmin) return;
  await supabaseAdmin.from("subscriptions").upsert(
    {
      email: email.toLowerCase(),
      plan,
      status,
      stripe_customer_id: customerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );
}

async function emailForCustomer(customerId: string): Promise<string | null> {
  if (!stripe) return null;
  const cust = await stripe.customers.retrieve(customerId);
  if (cust.deleted) return null;
  return cust.email ?? null;
}

export async function POST(req: Request) {
  // Not configured yet → acknowledge so Stripe stops retrying, but do nothing.
  if (!stripe || !whSecret || !supabaseAdmin) {
    return NextResponse.json({ received: true, configured: false });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

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
        if (plan && email) {
          await setPlan(email, plan, customerId, "active");
        } else {
          // A completed checkout we cannot provision must be LOUD, never silent —
          // the customer was charged. Surfaces in logs for reconciliation/alerting
          // (the top "silent plan=null" launch risk).
          console.error("[stripe] checkout.session.completed NOT provisioned", {
            sessionId: s.id,
            customerId,
            hasEmail: !!email,
            plan: plan ?? "null (price id not in STRIPE_PRICE_* map)",
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await emailForCustomer(sub.customer as string);
        const active = sub.status === "active" || sub.status === "trialing";
        const plan = active ? planForPriceId(sub.items.data[0]?.price.id) ?? "free" : "free";
        await setPlan(email, plan, sub.customer as string, sub.status);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const email = await emailForCustomer(sub.customer as string);
        await setPlan(email, "free", sub.customer as string, "canceled");
        break;
      }
    }
  } catch {
    // Let Stripe retry transient failures.
    return NextResponse.json({ error: "handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
