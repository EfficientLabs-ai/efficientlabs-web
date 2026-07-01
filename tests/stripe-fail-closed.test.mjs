// Regression test for the Stripe webhook fail-closed provisioning invariant
// (commit 64b7674): planForPriceId must return null for any price id that is
// not explicitly mapped via STRIPE_PRICE_* env, which forces the webhook to
// 422 an active subscription with an unmapped price instead of silently
// mis-provisioning it.
//
// Run: node --experimental-strip-types --test tests/stripe-fail-closed.test.mjs

import assert from "node:assert/strict";
import { test } from "node:test";

import { planForPriceId } from "../lib/plans.ts";

const ENV_KEYS = [
  "STRIPE_PRICE_EXOS_PRO_MONTHLY",
  "STRIPE_PRICE_EXOS_PRO_ANNUAL",
  "STRIPE_PRICE_APEX_MONTHLY",
  "STRIPE_PRICE_APEX_ANNUAL",
  "STRIPE_PRICE_TEAMS_MONTHLY",
  "STRIPE_PRICE_TEAMS_ANNUAL",
];

// Distinct fake ids, one per env var (never real Stripe ids).
const FAKE_IDS = {
  STRIPE_PRICE_EXOS_PRO_MONTHLY: "price_fake_exos_pro_monthly",
  STRIPE_PRICE_EXOS_PRO_ANNUAL: "price_fake_exos_pro_annual",
  STRIPE_PRICE_APEX_MONTHLY: "price_fake_apex_monthly",
  STRIPE_PRICE_APEX_ANNUAL: "price_fake_apex_annual",
  STRIPE_PRICE_TEAMS_MONTHLY: "price_fake_teams_monthly",
  STRIPE_PRICE_TEAMS_ANNUAL: "price_fake_teams_annual",
};

const EXPECTED_SLUG = {
  STRIPE_PRICE_EXOS_PRO_MONTHLY: "exos_pro",
  STRIPE_PRICE_EXOS_PRO_ANNUAL: "exos_pro",
  STRIPE_PRICE_APEX_MONTHLY: "apex",
  STRIPE_PRICE_APEX_ANNUAL: "apex",
  STRIPE_PRICE_TEAMS_MONTHLY: "teams",
  STRIPE_PRICE_TEAMS_ANNUAL: "teams",
};

// planForPriceId reads process.env at CALL time, so each test sets the env it
// needs and restores whatever was there before it ran.
function withEnv(overrides, fn) {
  const saved = new Map(ENV_KEYS.map((key) => [key, process.env[key]]));
  try {
    for (const key of ENV_KEYS) {
      if (key in overrides && overrides[key] !== undefined) {
        process.env[key] = overrides[key];
      } else {
        delete process.env[key];
      }
    }
    return fn();
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("regression: unmapped price id returns null even with all six prices configured (fail-closed → webhook 422)", () => {
  withEnv(FAKE_IDS, () => {
    assert.equal(planForPriceId("price_not_in_map_123"), null);
  });
});

test("null, undefined, and empty string each return null", () => {
  withEnv(FAKE_IDS, () => {
    assert.equal(planForPriceId(null), null);
    assert.equal(planForPriceId(undefined), null);
    assert.equal(planForPriceId(""), null);
  });
});

test("each configured env var maps its price id to the correct plan slug", () => {
  withEnv(FAKE_IDS, () => {
    for (const key of ENV_KEYS) {
      assert.equal(
        planForPriceId(FAKE_IDS[key]),
        EXPECTED_SLUG[key],
        `${key} should map ${FAKE_IDS[key]} to ${EXPECTED_SLUG[key]}`,
      );
    }
  });
});

test("an unset env var must not map: its former price id returns null", () => {
  for (const removedKey of ENV_KEYS) {
    const partial = { ...FAKE_IDS };
    delete partial[removedKey];
    withEnv(partial, () => {
      assert.equal(
        planForPriceId(FAKE_IDS[removedKey]),
        null,
        `${removedKey} unset: ${FAKE_IDS[removedKey]} must not map`,
      );
    });
  }
});
