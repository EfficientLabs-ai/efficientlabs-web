import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_BEARER_BYTES = 4096;
const SECRET_MIN_BYTES = 32;
const CLOCK_SKEW_SECONDS = 60;
const OWNER_PROVIDER = "efficientlabs";
const SUPABASE_PROVIDER = "supabase";
const AUTO_MODE = "auto";

function normalizeEmail(email) {
  const value = typeof email === "string" ? email.trim().toLowerCase() : "";
  return value && value.includes("@") ? value : null;
}

function authError(message, statusCode = 401) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function base64urlJson(value) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeBase64urlJson(value, label) {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    throw authError(`invalid owner auth token ${label}`);
  }
}

function strongSecret(value) {
  return typeof value === "string" && Buffer.byteLength(value, "utf8") >= SECRET_MIN_BYTES;
}

function verifierMode(env = process.env) {
  const mode = String(env.AUTH_VERIFIER_MODE || AUTO_MODE).trim().toLowerCase();
  return [AUTO_MODE, OWNER_PROVIDER, SUPABASE_PROVIDER].includes(mode) ? mode : AUTO_MODE;
}

function supabaseConfigured(env = process.env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY);
}

export function authVerifierReadiness(env = process.env) {
  const mode = verifierMode(env);
  const ownerConfigured = strongSecret(env.AUTH_TOKEN_SECRET);
  const legacySupabaseConfigured = supabaseConfigured(env);

  let provider = null;
  if (mode === OWNER_PROVIDER) {
    provider = ownerConfigured ? OWNER_PROVIDER : null;
  } else if (mode === SUPABASE_PROVIDER) {
    provider = legacySupabaseConfigured ? SUPABASE_PROVIDER : null;
  } else if (ownerConfigured) {
    provider = OWNER_PROVIDER;
  } else if (legacySupabaseConfigured) {
    provider = SUPABASE_PROVIDER;
  }

  const missing = [];
  if (mode === OWNER_PROVIDER && !ownerConfigured) missing.push("AUTH_TOKEN_SECRET");
  if (mode === SUPABASE_PROVIDER && !legacySupabaseConfigured) missing.push("SUPABASE_URL/SUPABASE_ANON_KEY");
  if (mode === AUTO_MODE && !provider) missing.push("AUTH_TOKEN_SECRET or SUPABASE_URL/SUPABASE_ANON_KEY");

  return {
    configured: Boolean(provider),
    mode,
    provider,
    ownerConfigured,
    legacySupabaseConfigured,
    missing,
  };
}

export function signOwnerAuthToken(payload, env = process.env) {
  const secret = env.AUTH_TOKEN_SECRET;
  if (!strongSecret(secret)) {
    throw authError("owner auth token secret is not configured", 503);
  }

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    ...payload,
    iat: now,
    exp: now + Number(env.AUTH_TOKEN_TTL_SECONDS || 3600),
    ...(env.AUTH_TOKEN_ISSUER ? { iss: env.AUTH_TOKEN_ISSUER } : {}),
    ...(env.AUTH_TOKEN_AUDIENCE ? { aud: env.AUTH_TOKEN_AUDIENCE } : {}),
  };

  const encodedHeader = base64urlJson({ alg: "HS256", typ: "JWT" });
  const encodedPayload = base64urlJson(claims);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

function verifyOwnerAuthToken(token, env = process.env) {
  const secret = env.AUTH_TOKEN_SECRET;
  if (!strongSecret(secret)) {
    throw authError("owner auth verifier not configured", 503);
  }
  if (Buffer.byteLength(token, "utf8") > MAX_BEARER_BYTES) {
    throw authError("owner auth token too large");
  }

  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !part)) {
    throw authError("invalid owner auth token");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = decodeBase64urlJson(encodedHeader, "header");
  if (header.alg !== "HS256" || (header.typ && header.typ !== "JWT")) {
    throw authError("unsupported owner auth token header");
  }

  let signature;
  try {
    signature = Buffer.from(encodedSignature, "base64url");
  } catch {
    throw authError("invalid owner auth token signature");
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expected = createHmac("sha256", secret).update(signingInput).digest();
  if (signature.length !== expected.length || !timingSafeEqual(signature, expected)) {
    throw authError("invalid owner auth token signature");
  }

  const payload = decodeBase64urlJson(encodedPayload, "payload");
  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp <= now - CLOCK_SKEW_SECONDS) {
    throw authError("owner auth token expired");
  }
  if (typeof payload.nbf === "number" && payload.nbf > now + CLOCK_SKEW_SECONDS) {
    throw authError("owner auth token not yet valid");
  }
  if (env.AUTH_TOKEN_ISSUER && payload.iss !== env.AUTH_TOKEN_ISSUER) {
    throw authError("owner auth token issuer mismatch");
  }
  if (env.AUTH_TOKEN_AUDIENCE) {
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(env.AUTH_TOKEN_AUDIENCE)) {
      throw authError("owner auth token audience mismatch");
    }
  }

  const email = normalizeEmail(payload.email);
  if (!email) throw authError("owner auth token missing email");
  return email;
}

async function verifySupabaseBearer(authorization, env = process.env, fetchFn = fetch) {
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw authError("supabase auth verifier not configured", 503);
  }

  const response = await fetchFn(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseAnonKey,
      authorization,
    },
  });
  if (!response.ok) throw authError("invalid bearer token");
  const user = await response.json();
  return normalizeEmail(typeof user.email === "string" ? user.email : user.user?.email);
}

export async function emailForBearerAuthorization(authorization, env = process.env, fetchFn = fetch) {
  const auth = authorization || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;

  const readiness = authVerifierReadiness(env);
  if (!readiness.configured) {
    throw authError("auth verifier not configured", 503);
  }
  if (readiness.provider === OWNER_PROVIDER) {
    return verifyOwnerAuthToken(token, env);
  }
  if (readiness.provider === SUPABASE_PROVIDER) {
    return verifySupabaseBearer(auth, env, fetchFn);
  }
  throw authError("auth verifier not configured", 503);
}
