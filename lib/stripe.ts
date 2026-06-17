import Stripe from "stripe";

// Server-only Stripe client. Null until STRIPE_SECRET_KEY is set in the
// deployment, so the webhook degrades to a no-op instead of throwing. The
// secret is read from env and never logged or returned.
const key = process.env.STRIPE_SECRET_KEY;

export const stripe: Stripe | null = key ? new Stripe(key) : null;
