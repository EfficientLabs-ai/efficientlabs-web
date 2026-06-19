# Billing & account provisioning — go-live checklist

Checkout already works via Stripe **Payment Links** (on `/pricing`). This adds
**provisioning**: when someone pays, a webhook records their plan on their
Supabase account, and the OS (`/app`) reflects it. Until the env below is set,
the webhook is a no-op (it acknowledges and does nothing) and everyone reads as
`free` — nothing breaks.

## 1. Run the migration
Apply `supabase/migrations/0001_subscriptions.sql` in your Supabase project
(SQL editor or `supabase db push`). It creates `public.subscriptions` with RLS
so a user can read only their own row; the webhook writes via the service role.

## 2. Add the Stripe webhook
In the Stripe Dashboard → Developers → Webhooks, add an endpoint:

- URL: `https://<your-domain>/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

> The Payment Links must create **subscriptions** (they do for the recurring
> tiers). Setting each Payment Link's "after payment" redirect to a confirmation
> URL is optional but recommended.

## 3. Set environment variables (Vercel → Project → Settings → Env)
Secrets — never commit these:

| Var | What |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | from step 2 (`whsec_…`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key |
| `STRIPE_PRICE_EXOS_PRO_MONTHLY` / `_ANNUAL` | Price IDs behind the Exos Pro Payment Links |
| `STRIPE_PRICE_APEX_MONTHLY` / `_ANNUAL` | Price IDs behind the Apex Payment Links |
| `STRIPE_PRICE_TEAMS_MONTHLY` / `_ANNUAL` | Price IDs behind the Teams Payment Links |

Public (likely already set):

| Var | What |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project + anon key (enables sign-in) |
| `NEXT_PUBLIC_CALCOM_LINK` | e.g. `efficientlabs/enterprise` — powers the `/enterprise` scheduler |

The price IDs are the ones already backing your Payment Links (Stripe → Products
→ each price → copy ID). They're how the webhook maps a purchase to a plan.

## 4. Verify
Use Stripe test mode or a live test purchase with the **same email** as a
Supabase account, then check `public.subscriptions` for the row and confirm
`/app` → Settings shows the new plan.

## Notes
- Plan is matched by **email** (checkout email == account email). If a customer
  pays with a different email than their login, reconcile by updating the row's
  `email`, or extend the webhook to map by `stripe_customer_id`.
- Per-feature gating in `/app` currently surfaces the plan (Settings) and the
  upgrade CTA; deeper feature locks can read `useOs().plan`.
