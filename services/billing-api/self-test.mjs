#!/usr/bin/env node
import assert from "node:assert/strict";
import {
  emailForBearerAuthorization,
  signOwnerAuthToken,
} from "./auth-verifier.mjs";
import {
  hashPassword,
  verifyPassword,
} from "./password-auth.mjs";
import {
  currentPeriodEndForItem,
  planForPriceId,
  runtimeReadiness,
  server,
  subscriptionBillingItem,
} from "./server.mjs";

const HOST = "127.0.0.1";
const priceVars = {
  STRIPE_PRICE_EXOS_PRO_MONTHLY: "price_exos_pro_monthly",
  STRIPE_PRICE_EXOS_PRO_ANNUAL: "price_exos_pro_annual",
  STRIPE_PRICE_APEX_MONTHLY: "price_apex_monthly",
  STRIPE_PRICE_APEX_ANNUAL: "price_apex_annual",
  STRIPE_PRICE_TEAMS_MONTHLY: "price_teams_monthly",
  STRIPE_PRICE_TEAMS_ANNUAL: "price_teams_annual",
};

for (const [name, value] of Object.entries(priceVars)) process.env[name] = value;
process.env.STRIPE_SECRET_KEY ||= "sk_test_selftest";
process.env.STRIPE_WEBHOOK_SECRET ||= "whsec_selftest";
process.env.AUTH_VERIFIER_MODE = "efficientlabs";
process.env.AUTH_TOKEN_SECRET = "owner-auth-self-test-secret-32-bytes-minimum";
process.env.AUTH_TOKEN_ISSUER = "https://efficientlabs.ai";
process.env.AUTH_TOKEN_AUDIENCE = "efficientlabs-web";

assert.equal(planForPriceId("price_exos_pro_monthly"), "exos_pro");
assert.equal(planForPriceId("price_apex_annual"), "apex");
assert.equal(planForPriceId("price_teams_monthly"), "teams");
assert.equal(planForPriceId("price_unknown"), null);

const subscription = {
  items: {
    data: [
      { price: { id: "price_unmapped_addon" }, current_period_end: 1893456000 },
      { price: { id: "price_apex_monthly" }, current_period_end: 1896134400 },
    ],
  },
};
const billingItem = subscriptionBillingItem(subscription);
assert.equal(billingItem.price.id, "price_apex_monthly");
assert.equal(currentPeriodEndForItem(billingItem).toISOString(), "2030-02-01T00:00:00.000Z");
assert.equal(currentPeriodEndForItem({}), null);

const readiness = runtimeReadiness();
assert.equal(readiness.stripeConfigured, true);
assert.equal(readiness.priceMap.configured, true);
assert.equal(readiness.authVerifier.configured, true);
assert.equal(readiness.authVerifier.provider, "efficientlabs");

const ownerToken = signOwnerAuthToken({ email: "Founder@EfficientLabs.ai", sub: "owner-self-test" });
assert.equal(
  await emailForBearerAuthorization(`Bearer ${ownerToken}`),
  "founder@efficientlabs.ai",
);
await assert.rejects(
  () => emailForBearerAuthorization(`Bearer ${ownerToken}tampered`),
  /signature/,
);
const passwordHash = await hashPassword("correct horse battery staple");
assert.equal(await verifyPassword("correct horse battery staple", passwordHash), true);
assert.equal(await verifyPassword("wrong horse battery staple", passwordHash), false);

delete process.env.STRIPE_PRICE_TEAMS_ANNUAL;
assert.equal(runtimeReadiness().stripeConfigured, false);
process.env.STRIPE_PRICE_TEAMS_ANNUAL = priceVars.STRIPE_PRICE_TEAMS_ANNUAL;

const listener = await new Promise((resolve) => {
  const instance = server.listen(0, HOST, () => resolve(instance));
});

try {
  const { port } = listener.address();
  const health = await fetch(`http://${HOST}:${port}/health`);
  assert.equal([200, 503].includes(health.status), true);

  const anonPlan = await fetch(`http://${HOST}:${port}/billing/account/plan`);
  assert.equal(anonPlan.status, 200);
  assert.deepEqual(await anonPlan.json(), { signedIn: false, plan: "free" });

  const session = await fetch(`http://${HOST}:${port}/auth/session`, {
    headers: { authorization: `Bearer ${ownerToken}` },
  });
  assert.equal(session.status, 200);
  assert.deepEqual(await session.json(), {
    signedIn: true,
    email: "founder@efficientlabs.ai",
  });

  const missing = await fetch(`http://${HOST}:${port}/nope`);
  assert.equal(missing.status, 404);

  console.log("billing-api self-test OK");
} finally {
  await new Promise((resolve) => listener.close(resolve));
}
