#!/usr/bin/env node
import { Pool } from "pg";
import {
  PRICE_ENV_VARS,
  postgresPoolConfig,
  runtimeReadiness,
} from "./server.mjs";

const args = new Set(process.argv.slice(2));
const allowTestStripe = args.has("--allow-test-stripe");
const skipDb = args.has("--skip-db");
const failures = [];

function requirePrefix(name, prefix, { allowTestPrefix = null } = {}) {
  const value = process.env[name];
  if (!value) {
    failures.push(`${name} is missing`);
    return;
  }
  if (value.startsWith(prefix)) return;
  if (allowTestPrefix && allowTestStripe && value.startsWith(allowTestPrefix)) return;
  failures.push(`${name} must use ${prefix}*${allowTestPrefix && allowTestStripe ? ` or ${allowTestPrefix}*` : ""}`);
}

requirePrefix("STRIPE_SECRET_KEY", "sk_live_", { allowTestPrefix: "sk_test_" });
requirePrefix("STRIPE_WEBHOOK_SECRET", "whsec_");
for (const [name] of PRICE_ENV_VARS) requirePrefix(name, "price_");

const readiness = runtimeReadiness();
if (!readiness.authVerifier.configured) {
  failures.push("auth verifier is missing SUPABASE_URL/SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_* fallbacks");
}

let databaseStatus = "skipped";
if (!skipDb) {
  const pool = new Pool(postgresPoolConfig());
  try {
    await pool.query("select 1");
    const table = await pool.query("select to_regclass('public.subscriptions') as table_name");
    if (!table.rows[0]?.table_name) {
      failures.push("public.subscriptions table is missing");
      databaseStatus = "missing-table";
    } else {
      databaseStatus = "ok";
    }
  } catch (err) {
    databaseStatus = "error";
    failures.push(`database check failed: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await pool.end();
  }
}

if (failures.length) {
  console.error("billing-api preflight failed");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("billing-api preflight OK");
console.log(`- database: ${databaseStatus}`);
console.log("- stripe: configured");
console.log("- price map: configured");
console.log("- auth verifier: configured");
