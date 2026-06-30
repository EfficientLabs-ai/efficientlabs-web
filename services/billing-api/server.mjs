#!/usr/bin/env node
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import Stripe from "stripe";

const HOST = process.env.BILLING_API_HOST || "127.0.0.1";
const PORT = Number(process.env.BILLING_API_PORT || 4101);
const MAX_BODY_BYTES = Number(process.env.BILLING_API_MAX_BODY_BYTES || 2 * 1024 * 1024);

export const STRIPE_API_VERSION = "2026-02-25.clover";
export const PRICE_ENV_VARS = [
  ["STRIPE_PRICE_EXOS_PRO_MONTHLY", "exos_pro"],
  ["STRIPE_PRICE_EXOS_PRO_ANNUAL", "exos_pro"],
  ["STRIPE_PRICE_APEX_MONTHLY", "apex"],
  ["STRIPE_PRICE_APEX_ANNUAL", "apex"],
  ["STRIPE_PRICE_TEAMS_MONTHLY", "teams"],
  ["STRIPE_PRICE_TEAMS_ANNUAL", "teams"],
];

const PLAN_VALUES = new Set(["free", "exos_pro", "apex", "teams"]);
const stripeKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: STRIPE_API_VERSION }) : null;

export function postgresPoolConfig(env = process.env) {
  if (env.DATABASE_URL) {
    return {
      connectionString: env.DATABASE_URL,
      max: Number(env.POSTGRES_POOL_MAX || 5),
      allowExitOnIdle: true,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: env.POSTGRES_SSL === "require" ? { rejectUnauthorized: true } : undefined,
    };
  }

  return {
    host: env.PGHOST || "/var/run/postgresql",
    database: env.PGDATABASE || "efficientlabs",
    user: env.PGUSER || env.USER || "neo",
    max: Number(env.POSTGRES_POOL_MAX || 5),
    allowExitOnIdle: true,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  };
}

const pool = new Pool(postgresPoolConfig());

function json(res, status, body) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function normalizeEmail(email) {
  const value = typeof email === "string" ? email.trim().toLowerCase() : "";
  return value && value.includes("@") ? value : null;
}

export function planForPriceId(priceId, env = process.env) {
  if (!priceId) return null;
  const entries = PRICE_ENV_VARS.map(([name, plan]) => [env[name], plan]);
  return entries.find(([id]) => id && id === priceId)?.[1] || null;
}

export function runtimeReadiness(env = process.env) {
  const missingPrices = PRICE_ENV_VARS
    .map(([name]) => name)
    .filter((name) => !env[name]);
  const hasAuthVerifier = Boolean(
    (env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL)
      && (env.SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
  );

  return {
    stripeSecret: Boolean(env.STRIPE_SECRET_KEY),
    stripeWebhookSecret: Boolean(env.STRIPE_WEBHOOK_SECRET),
    priceMap: {
      configured: missingPrices.length === 0,
      missing: missingPrices,
    },
    authVerifier: {
      configured: hasAuthVerifier,
    },
    stripeConfigured: Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET && missingPrices.length === 0),
  };
}

async function readBody(req) {
  let total = 0;
  const chunks = [];
  for await (const chunk of req) {
    total += chunk.length;
    if (total > MAX_BODY_BYTES) {
      const err = new Error("request body too large");
      err.statusCode = 413;
      throw err;
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function upsertSubscription(input) {
  const email = normalizeEmail(input.email);
  if (!email || !PLAN_VALUES.has(input.plan)) return false;

  await pool.query(
    `
      insert into subscriptions (
        email,
        plan,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        current_period_end,
        updated_at
      )
      values ($1, $2, $3, $4, $5, $6, now())
      on conflict (email) do update set
        plan = excluded.plan,
        status = excluded.status,
        stripe_customer_id = coalesce(excluded.stripe_customer_id, subscriptions.stripe_customer_id),
        stripe_subscription_id = coalesce(excluded.stripe_subscription_id, subscriptions.stripe_subscription_id),
        current_period_end = excluded.current_period_end,
        updated_at = now()
    `,
    [
      email,
      input.plan,
      input.status || null,
      input.stripeCustomerId || null,
      input.stripeSubscriptionId || null,
      input.currentPeriodEnd || null,
    ],
  );
  return true;
}

async function getSubscriptionByEmail(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  const result = await pool.query(
    `
      select
        email,
        plan,
        status,
        stripe_customer_id,
        stripe_subscription_id,
        current_period_end::text,
        updated_at::text
      from subscriptions
      where email = $1
      limit 1
    `,
    [normalized],
  );
  return result.rows[0] || null;
}

async function emailForBearer(req) {
  const auth = req.headers.authorization || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    const err = new Error("auth verifier not configured");
    err.statusCode = 503;
    throw err;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      authorization: auth,
    },
  });
  if (!response.ok) {
    const err = new Error("invalid bearer token");
    err.statusCode = 401;
    throw err;
  }
  const user = await response.json();
  return normalizeEmail(typeof user.email === "string" ? user.email : user.user?.email);
}

async function handlePlan(req, res) {
  const email = await emailForBearer(req);
  if (!email) {
    return json(res, 200, { signedIn: false, plan: "free" });
  }
  const subscription = await getSubscriptionByEmail(email);
  return json(res, 200, {
    signedIn: true,
    email,
    plan: subscription?.plan || "free",
    status: subscription?.status || null,
    updatedAt: subscription?.updated_at || null,
  });
}

function currentPeriodEnd(subscription) {
  const value = subscription?.current_period_end;
  return typeof value === "number" ? new Date(value * 1000) : null;
}

async function emailForCustomer(customerId) {
  if (!stripe || !customerId) return null;
  const customer = await stripe.customers.retrieve(customerId);
  return customer.deleted ? null : customer.email || null;
}

async function handleStripeWebhook(req, res) {
  if (!stripe || !stripeWebhookSecret) {
    console.error("[billing-api] stripe fulfillment not configured", {
      hasStripe: Boolean(stripe),
      hasWebhookSecret: Boolean(stripeWebhookSecret),
    });
    return json(res, 503, { error: "fulfillment not configured" });
  }

  const signature = req.headers["stripe-signature"] || "";
  const rawBody = await readBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, stripeWebhookSecret);
  } catch {
    return json(res, 400, { error: "invalid signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        let email = session.customer_details?.email || session.customer_email || null;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id || null;
        let plan = null;
        let subscriptionId = null;
        let periodEnd = null;

        if (session.subscription) {
          subscriptionId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          plan = planForPriceId(subscription.items.data[0]?.price.id);
          periodEnd = currentPeriodEnd(subscription);
        } else {
          const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          plan = planForPriceId(items.data[0]?.price?.id);
        }
        email ||= await emailForCustomer(customerId);

        if (!plan || !email) {
          console.error("[billing-api] checkout not provisionable", {
            sessionId: session.id,
            hasEmail: Boolean(email),
            hasPlan: Boolean(plan),
          });
          return json(res, 422, { error: "checkout not provisionable" });
        }

        const written = await upsertSubscription({
          email,
          plan,
          status: "active",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          currentPeriodEnd: periodEnd,
        });
        if (!written) return json(res, 500, { error: "fulfillment write failed" });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
        const email = await emailForCustomer(customerId);
        const active = subscription.status === "active" || subscription.status === "trialing";
        const plan = active ? planForPriceId(subscription.items.data[0]?.price.id) : "free";

        if (!plan || !email) {
          console.error("[billing-api] subscription update not provisionable", {
            subscriptionId: subscription.id,
            status: subscription.status,
            hasEmail: Boolean(email),
            hasPlan: Boolean(plan),
          });
          return json(res, 422, { error: "subscription not provisionable" });
        }

        const written = await upsertSubscription({
          email,
          plan,
          status: subscription.status,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: currentPeriodEnd(subscription),
        });
        if (!written) return json(res, 500, { error: "fulfillment write failed" });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
        const email = await emailForCustomer(customerId);
        const written = await upsertSubscription({
          email,
          plan: "free",
          status: "canceled",
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          currentPeriodEnd: currentPeriodEnd(subscription),
        });
        if (!written) {
          console.error("[billing-api] subscription deletion not persisted", {
            subscriptionId: subscription.id,
            hasEmail: Boolean(email),
          });
          return json(res, 500, { error: "fulfillment write failed" });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[billing-api] webhook handler error", {
      type: event.type,
      message: err instanceof Error ? err.message : String(err),
    });
    return json(res, 500, { error: "handler error" });
  }

  return json(res, 200, { received: true });
}

async function handleHealth(_req, res) {
  try {
    await pool.query("select 1");
    const readiness = runtimeReadiness();
    return json(res, 200, {
      status: "healthy",
      service: "efficientlabs-billing-api",
      database: "ok",
      stripe: readiness.stripeConfigured ? "configured" : "unconfigured",
      priceMap: readiness.priceMap.configured ? "configured" : "incomplete",
      authVerifier: readiness.authVerifier.configured ? "configured" : "unconfigured",
    });
  } catch {
    return json(res, 503, {
      status: "unhealthy",
      service: "efficientlabs-billing-api",
      database: "error",
    });
  }
}

async function route(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
  try {
    if (req.method === "GET" && url.pathname === "/health") return handleHealth(req, res);
    if (req.method === "GET" && url.pathname === "/billing/account/plan") return handlePlan(req, res);
    if (req.method === "POST" && url.pathname === "/billing/stripe/webhook") return handleStripeWebhook(req, res);
    return json(res, 404, { error: "not found" });
  } catch (err) {
    const status = Number(err?.statusCode || 500);
    if (status >= 500) {
      console.error("[billing-api] request failed", {
        method: req.method,
        path: url.pathname,
        status,
        message: err instanceof Error ? err.message : String(err),
      });
    }
    return json(res, status, { error: status >= 500 ? "billing API error" : err.message });
  }
}

export const server = http.createServer(route);

const entrypoint = process.argv[1] ? path.resolve(process.argv[1]) : "";
const modulePath = path.resolve(fileURLToPath(import.meta.url));

if (entrypoint === modulePath) {
  server.listen(PORT, HOST, () => {
    console.log(`efficientlabs-billing-api listening on http://${HOST}:${PORT}`);
  });
}
