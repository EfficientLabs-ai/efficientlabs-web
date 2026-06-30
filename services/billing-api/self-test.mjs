#!/usr/bin/env node
import assert from "node:assert/strict";
import { server } from "./server.mjs";

const HOST = "127.0.0.1";

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

  const missing = await fetch(`http://${HOST}:${port}/nope`);
  assert.equal(missing.status, 404);

  console.log("billing-api self-test OK");
} finally {
  await new Promise((resolve) => listener.close(resolve));
}
