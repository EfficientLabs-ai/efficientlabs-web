#!/usr/bin/env node
/**
 * ship — the bridge between building and the website.
 *
 *   node scripts/ship.mjs status <L#> "<capability name>" <live|wired|standalone|mock> "<note>"
 *   node scripts/ship.mjs release "<title>" "<body>"
 *
 * It (1) updates data/status.json (flips a capability's level), (2) appends a
 * dated entry to data/updates.json (the public changelog), (3) queues a content
 * piece in docs/content-queue.md, and (4) notifies the audience via Resend —
 * but ONLY if RESEND_API_KEY + RESEND_AUDIENCE_ID are set; otherwise it prints
 * the payload it WOULD send (honest dry-run). Re-deploy to publish.
 */
import { readFileSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const P = {
  status: join(ROOT, "data/status.json"),
  updates: join(ROOT, "data/updates.json"),
  content: join(ROOT, "docs/content-queue.md"),
};
const today = new Date().toISOString().slice(0, 10);
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const write = (p, o) => writeFileSync(p, JSON.stringify(o, null, 2) + "\n");

const [, , cmd, ...rest] = process.argv;

function addUpdate(entry) {
  const updates = read(P.updates);
  updates.unshift({ date: today, ...entry });
  write(P.updates, updates);
}
function queueContent(title, body) {
  if (!existsSync(P.content)) writeFileSync(P.content, "# Content queue (auto-generated from ships)\n\n");
  appendFileSync(P.content, `\n## ${today} — ${title}\n${body}\n- [ ] short-form hook\n- [ ] build-in-public post\n- [ ] demo clip\n`);
}

async function notify(subject, html) {
  const key = process.env.RESEND_API_KEY;
  const audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) {
    console.log("\n[notify] DRY-RUN (set RESEND_API_KEY + RESEND_AUDIENCE_ID to send):");
    console.log(`  subject: ${subject}`);
    return;
  }
  // Resend Broadcasts: create → send to the audience
  const create = await fetch("https://api.resend.com/broadcasts", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ audience_id: audience, from: "Efficient Labs <hello@efficientlabs.ai>", subject, html }),
  }).then((r) => r.json());
  if (!create?.id) { console.error("[notify] create failed:", create); return; }
  const send = await fetch(`https://api.resend.com/broadcasts/${create.id}/send`, {
    method: "POST", headers: { Authorization: `Bearer ${key}` },
  }).then((r) => r.json());
  console.log("[notify] broadcast sent:", send);
}

if (cmd === "status") {
  const [layerId, capName, level, note = ""] = rest;
  const valid = ["live", "wired", "standalone", "mock"];
  if (!layerId || !capName || !valid.includes(level)) {
    console.error('usage: ship status <L#> "<cap name>" <live|wired|standalone|mock> "<note>"');
    process.exit(1);
  }
  const data = read(P.status);
  const layer = data.layers.find((l) => l.id.toLowerCase() === layerId.toLowerCase());
  const cap = layer?.caps.find((c) => c.name.toLowerCase().includes(capName.toLowerCase()));
  if (!cap) { console.error(`capability not found: ${layerId} / ${capName}`); process.exit(1); }
  const prev = cap.level;
  cap.level = level;
  write(P.status, data);
  const title = `${cap.name} is now ${data.levels[level].label}`;
  const body = note || `${cap.name} moved from ${data.levels[prev].label} to ${data.levels[level].label}.`;
  addUpdate({ title, kind: "capability", level, layer: layer.id, body });
  queueContent(title, body);
  console.log(`✓ ${cap.name}: ${prev} → ${level}`);
  if (level === "live") await notify(`🚀 ${title}`, `<p>${body}</p><p>See it live: https://efficientlabs.ai/#status</p>`);
} else if (cmd === "release") {
  const [title, body = ""] = rest;
  if (!title) { console.error('usage: ship release "<title>" "<body>"'); process.exit(1); }
  addUpdate({ title, kind: "release", body });
  queueContent(title, body);
  console.log(`✓ release: ${title}`);
  await notify(`✨ ${title}`, `<p>${body}</p><p>https://efficientlabs.ai/updates</p>`);
} else {
  console.error('usage:\n  ship status <L#> "<cap>" <level> "<note>"\n  ship release "<title>" "<body>"');
  process.exit(1);
}
console.log("→ remember to redeploy so the site reflects the change.");
