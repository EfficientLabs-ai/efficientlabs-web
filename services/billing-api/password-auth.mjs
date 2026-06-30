import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const HASH_VERSION = "v1";
const KEY_LENGTH = 64;
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export function passwordPolicyError(password) {
  if (typeof password !== "string") return "password is required";
  if (password.length < 12) return "password must be at least 12 characters";
  if (password.length > 256) return "password is too long";
  return null;
}

export async function hashPassword(password) {
  const policyError = passwordPolicyError(password);
  if (policyError) throw new Error(policyError);

  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });

  return [
    "scrypt",
    HASH_VERSION,
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("base64url"),
    Buffer.from(derived).toString("base64url"),
  ].join("$");
}

export async function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") return false;

  const [scheme, version, n, r, p, saltEncoded, hashEncoded] = storedHash.split("$");
  if (scheme !== "scrypt" || version !== HASH_VERSION || !saltEncoded || !hashEncoded) {
    return false;
  }

  const salt = Buffer.from(saltEncoded, "base64url");
  const expected = Buffer.from(hashEncoded, "base64url");
  if (expected.length !== KEY_LENGTH) return false;

  const params = { N: Number(n), r: Number(r), p: Number(p) };
  if (!Number.isFinite(params.N) || !Number.isFinite(params.r) || !Number.isFinite(params.p)) {
    return false;
  }

  let derived;
  try {
    derived = await scrypt(password, salt, expected.length, params);
  } catch {
    return false;
  }
  const actual = Buffer.from(derived);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
