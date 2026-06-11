/**
 * verify-receipts.ts — the IN-BROWSER receipt verifier: the demo IS the feature.
 * ============================================================================
 * A faithful port of `verifyBundle()` from the public StratosAgent repo
 * (src/ledger/capability-receipt.js + src/security/quantum-crypto.js): every
 * visitor's browser replays the full hash chain and checks BOTH halves of the
 * hybrid post-quantum signature (Ed25519 + ML-DSA-65) on every receipt, holding
 * ONLY the node's public key embedded in the published bundle.
 *
 * FAIL-CLOSED, exactly like the original: a missing public key, a broken chain
 * link, an altered field, or either signature half failing → BROKEN. The page
 * shows the ACTUAL result of THIS run — never a stored one.
 *
 * Crypto comes from the same audited pure-JS suite the node itself uses
 * (@noble/post-quantum for ML-DSA-65; @noble/curves for Ed25519). This module
 * is dynamically imported by the verify card so ~0 bytes of it ship in the
 * main bundle.
 */
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import { ed25519 } from "@noble/curves/ed25519.js";
import { ml_dsa65 } from "@noble/post-quantum/ml-dsa.js";

export type ReceiptSig = { ed25519Sig: string; mldsaSig: string };
export type Receipt = {
  receipt_id: string;
  ts: number;
  actor_id: string;
  action: string;
  ref: string | null;
  node_id: string;
  owner_wallet: string | null;
  input_hash: string;
  output_hash: string;
  cost_units: number;
  caller_id: string | null;
  prev_hash: string;
  hash: string;
  sig?: ReceiptSig;
};
export type ReceiptBundle = {
  format: string;
  exported_at: number;
  receipts: Receipt[];
  public_key?: Record<string, string>; // base64 — ed25519Der (SPKI) + mldsaDer (raw), x25519/mlkem unused here
  node_id?: string;
};
export type VerifyResult = {
  ok: boolean;
  count: number;
  /** node DID DERIVED from the public key in this browser — not trusted from the bundle. */
  derivedDid: string | null;
  /** true when the bundle's own node_id claim matches what we derived. */
  didMatches: boolean | null;
  brokenAt?: number;
  reason?: string;
};

/* ── byte helpers (browser + node, no Buffer dependency) ────────────────── */
function b64ToBytes(b64: string): Uint8Array {
  if (typeof atob === "function") {
    const bin = atob(b64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }
  return new Uint8Array(globalThis.Buffer.from(b64, "base64"));
}
const utf8 = new TextEncoder();

/* ── canonical JSON — byte-for-byte the node's construction ─────────────── */
function canonical(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(canonical).join(",") + "]";
  const o = v as Record<string, unknown>;
  return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + canonical(o[k])).join(",") + "}";
}
const sha256hex = (s: string) => bytesToHex(sha256(utf8.encode(s)));

/** The SIGNED body — same explicit field set as the node (envelope excluded). */
// BODY VERSIONING (legacy v0, mirrors the node): receipts persisted before owner_wallet entered
// the schema carry NO owner_wallet key — their hash and signatures cover the body WITHOUT it.
// Keyed on own-property presence; tampering presence either way breaks hash AND signature.
const receiptBody = (r: Receipt) => {
  const body: Record<string, unknown> = {
    receipt_id: r.receipt_id,
    ts: r.ts,
    actor_id: r.actor_id,
    action: r.action,
    ref: r.ref,
    node_id: r.node_id,
    input_hash: r.input_hash,
    output_hash: r.output_hash,
    cost_units: r.cost_units,
    caller_id: r.caller_id ?? null,
    prev_hash: r.prev_hash,
  };
  if (Object.hasOwn(r, "owner_wallet")) body.owner_wallet = r.owner_wallet ?? null; // absent = legacy v0
  return body;
};
const canonicalBody = (r: Receipt) => canonical(receiptBody(r));
const hashReceipt = (r: Receipt) => sha256hex(canonicalBody(r));

/* ── key handling ───────────────────────────────────────────────────────── */
// Ed25519 SPKI DER = a fixed 12-byte header + the 32 raw key bytes (RFC 8410).
const ED25519_SPKI_PREFIX = [0x30, 0x2a, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x70, 0x03, 0x21, 0x00];
function ed25519RawFromSpki(der: Uint8Array): Uint8Array {
  if (der.length !== 44 || ED25519_SPKI_PREFIX.some((b, i) => der[i] !== b)) {
    throw new Error("not an Ed25519 SPKI key");
  }
  return der.slice(12);
}

/** did:atmos derived from the SIGNING public keys — same construction as the node's originId(). */
function deriveDid(ed25519Der: Uint8Array, mldsaDer: Uint8Array): string {
  const cat = new Uint8Array(ed25519Der.length + mldsaDer.length);
  cat.set(ed25519Der, 0);
  cat.set(mldsaDer, ed25519Der.length);
  return "did:atmos:" + bytesToHex(sha256(cat)).slice(0, 40);
}

/* ── the verifier ───────────────────────────────────────────────────────── */
export function verifyReceiptBundle(bundle: ReceiptBundle): VerifyResult {
  const fail = (reason: string, brokenAt?: number): VerifyResult => ({
    ok: false, count: bundle?.receipts?.length ?? 0, derivedDid: null, didMatches: null, brokenAt, reason,
  });
  if (!bundle || !Array.isArray(bundle.receipts)) return fail("malformed bundle");
  if (!bundle.public_key?.ed25519Der || !bundle.public_key?.mldsaDer) {
    return fail("bundle carries no public key — cannot verify (fail-closed)");
  }

  let edPub: Uint8Array, mldsaPub: Uint8Array, edDer: Uint8Array;
  try {
    edDer = b64ToBytes(bundle.public_key.ed25519Der);
    edPub = ed25519RawFromSpki(edDer);
    mldsaPub = b64ToBytes(bundle.public_key.mldsaDer);
  } catch (e) {
    return fail("unusable public key: " + (e as Error).message);
  }
  const derivedDid = deriveDid(edDer, mldsaPub);

  // Replay the chain — anchor on the first receipt's declared predecessor
  // (supports `since`-filtered partial exports), then every link must hold.
  let prev: string | null = null;
  for (let i = 0; i < bundle.receipts.length; i++) {
    const r = bundle.receipts[i];
    if (!r || typeof r !== "object") return fail("malformed receipt", i);
    if (prev === null) prev = r.prev_hash;
    if (r.prev_hash !== prev) return fail("broken chain link (removed/reordered)", i);
    if (r.hash !== hashReceipt(r)) return fail("receipt tampered (field altered)", i);
    if (!r.sig?.ed25519Sig || !r.sig?.mldsaSig) return fail("missing hybrid signature (fail-closed)", i);

    const body = utf8.encode(canonicalBody(r));
    let edOk = false, pqOk = false;
    try { edOk = ed25519.verify(b64ToBytes(r.sig.ed25519Sig), body, edPub); } catch { edOk = false; }
    if (!edOk) return fail("Ed25519 signature failed (tamper or wrong signer)", i);
    try { pqOk = ml_dsa65.verify(b64ToBytes(r.sig.mldsaSig), body, mldsaPub); } catch { pqOk = false; }
    if (!pqOk) return fail("ML-DSA-65 signature failed (tamper or wrong signer)", i);

    prev = r.hash;
  }

  return {
    ok: true,
    count: bundle.receipts.length,
    derivedDid,
    didMatches: bundle.node_id ? bundle.node_id === derivedDid : null,
  };
}

/**
 * The "break it yourself" half of the demo: clone the bundle, alter ONE field
 * (cost_units on the first receipt), and re-verify. A correct verifier MUST
 * return BROKEN — shown live so visitors see the proof fails closed.
 */
export function verifyTamperedCopy(bundle: ReceiptBundle): VerifyResult {
  const copy: ReceiptBundle = JSON.parse(JSON.stringify(bundle));
  if (copy.receipts?.[0]) copy.receipts[0].cost_units += 1;
  return verifyReceiptBundle(copy);
}
