# Billing & account provisioning — go-live checklist

Checkout already works via Stripe **Payment Links** (on `/pricing`). This adds
**provisioning**: when someone pays, a webhook records their plan in the
owner-controlled Postgres ledger behind `DATABASE_URL`.

The public Next webhook route is a stable URL only. Fulfillment runs on the VPS
`billing-api` service so Postgres stays private and loopback-only. The webhook is
fail-closed. If Stripe, the webhook secret, the billing API, or Postgres is not
configured, it returns a non-2xx response so Stripe retries and the failure is
visible. A paid customer must never be silently acknowledged without a persisted
plan row.

## 1. Run the migration
Apply `database/migrations/0001_billing_subscriptions.sql` on the self-hosted
Postgres instance:

```bash
psql "$DATABASE_URL" -f database/migrations/0001_billing_subscriptions.sql
psql "$DATABASE_URL" -f database/migrations/0002_owner_auth_accounts.sql
```

The VPS billing API is the only trusted reader/writer for billing and owner auth
tables. Do not expose these tables directly to browsers, and do not expose
Postgres publicly for Vercel.

## 2. Add the Stripe webhook
In the Stripe Dashboard → Developers → Webhooks, add an endpoint:

- URL: `https://<your-domain>/api/stripe/webhook`
- Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

Copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

> The Payment Links must create **subscriptions** (they do for the recurring
> tiers). Setting each Payment Link's "after payment" redirect to a confirmation
> URL is optional but recommended.

## 3. Set environment variables

Use `.env.example` as the no-secret inventory. Keep actual values in Vercel
environment variables or the VPS process manager/env file only. Never commit a
filled `.env.local`, `.env.production`, vault export, or PM2 env file.

### Vercel

| Var | What |
|---|---|
| `BILLING_API_BASE_URL` | HTTPS origin for the VPS billing API, e.g. `https://api.efficientlabs.ai/` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | temporary browser auth client while owner-controlled auth replaces Supabase |

Vercel must not receive `DATABASE_URL` for the self-hosted billing ledger.
After changing Vercel env vars, redeploy the affected environment so runtime
functions see the new value.

### VPS billing API

Secrets — never commit these:

| Var | What |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | from step 2 (`whsec_…`) |
| `DATABASE_URL` | optional owner-controlled Postgres connection string; omit when using local peer auth |
| `PGHOST` / `PGDATABASE` / `PGUSER` | local peer-auth fallback, usually `/var/run/postgresql`, `efficientlabs`, `neo` |
| `POSTGRES_POOL_MAX` | optional pool cap; default `5` |
| `POSTGRES_SSL` | optional; set `require` only when the DB endpoint needs TLS |
| `AUTH_VERIFIER_MODE` | `efficientlabs` for launch; `supabase` only as an explicit legacy fallback |
| `AUTH_TOKEN_SECRET` | owner-controlled HMAC signing secret for account-plan bearer tokens; generate with `openssl rand -base64 32` |
| `AUTH_TOKEN_ISSUER` | expected owner-token issuer, usually `https://efficientlabs.ai` |
| `AUTH_TOKEN_AUDIENCE` | expected owner-token audience, usually `efficientlabs-web` |
| `AUTH_TOKEN_TTL_SECONDS` | owner-token lifetime; default `3600` |
| `AUTH_SIGNUPS_ENABLED` | set `false` to pause public account creation without disabling login |
| `AUTH_SIGNUP_CODE` | optional founder-controlled signup code for invite-only launch waves |
| `AUTH_RATE_WINDOW_MS` / `AUTH_RATE_MAX` | in-process signup/login throttle; defaults to 20 attempts per 15 minutes |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` | legacy fallback only while Supabase auth is being retired |
| `STRIPE_PRICE_EXOS_PRO_MONTHLY` / `_ANNUAL` | Price IDs behind the Exos Pro Payment Links |
| `STRIPE_PRICE_APEX_MONTHLY` / `_ANNUAL` | Price IDs behind the Apex Payment Links |
| `STRIPE_PRICE_TEAMS_MONTHLY` / `_ANNUAL` | Price IDs behind the Teams Payment Links |

Public (likely already set):

| Var | What |
|---|---|
| `NEXT_PUBLIC_CALCOM_LINK` | e.g. `efficientlabs/enterprise` — powers the `/enterprise` scheduler |

The price IDs are the ones already backing your Payment Links (Stripe → Products
→ each price → copy ID). They're how the webhook maps a purchase to a plan.

Live go/no-go checks:

```bash
# Vercel, production + preview
vercel env ls production
vercel env ls preview

# VPS, without printing secret values
npm run billing-api:preflight
npm run billing-api:preflight -- --require-owner-auth
curl -fsS http://127.0.0.1:4101/health
curl -fsS https://api.efficientlabs.ai/health
```

The health response must move from
`stripe=unconfigured priceMap=incomplete authVerifier=unconfigured` to
`stripe=configured priceMap=configured authVerifier=configured` before accepting
live paid traffic. For launch, the health response should also show
`authVerifierProvider=efficientlabs`, and the stronger gate is
`npm run billing-api:preflight -- --require-owner-auth` because it verifies the
Postgres table, live Stripe secret shape, complete Price ID map, and the
owner-controlled auth verifier without logging secret values.

Run the loopback service:

```bash
cd /home/neo/efficientlabs-web
npm --prefix services/billing-api ci
npm run billing-api:start
```

Before accepting live payments, run the production preflight on the VPS. It
verifies the Postgres table, live Stripe secret shape, webhook secret shape,
complete Price ID map, and owner-controlled auth verifier without printing
secret values:

```bash
npm run billing-api:preflight -- --require-owner-auth
```

For isolated Stripe test-mode drills only:

```bash
npm run billing-api:preflight -- --allow-test-stripe
```

Publish only the exact billing paths through Caddy/Cloudflare:

- `GET /health`
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/session`
- `GET /billing/account/plan`
- `POST /billing/stripe/webhook`

## 4. Verify
Use Stripe test mode or a live test purchase, then check Postgres:

```sql
select email, plan, status, stripe_customer_id, stripe_subscription_id, updated_at
from subscriptions
order by updated_at desc
limit 5;
```

Then confirm owner auth and plan reads end-to-end:

```bash
# public app, same-origin cookie flow
curl -i https://efficientlabs.ai/api/auth/session

# VPS API, bearer-token flow used by the app server after login
curl -fsS -H "authorization: Bearer <owner-token>" https://api.efficientlabs.ai/auth/session
curl -fsS -H "authorization: Bearer <owner-token>" https://api.efficientlabs.ai/billing/account/plan
```

`/api/account/plan` on the public app should reflect the row for a signed-in
account without exposing the bearer token to browser JavaScript.

## Notes
- Plan is matched by **email**. If a customer pays with a different email than
  their login, reconcile by updating the row's `email`, or extend the app to map
  by `stripe_customer_id`.
- Per-feature gating in `/app` currently surfaces the plan (Settings) and the
  upgrade CTA; deeper feature locks can read `useOs().plan`.
- Account auth now uses owner-controlled Postgres and same-origin HttpOnly
  cookies. Supabase remains only as a deliberately selected server-side legacy
  verifier mode during cutover.
