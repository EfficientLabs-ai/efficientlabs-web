// Plan model shared by the Stripe webhook (server) and the OS shell (client).
// Stripe Price IDs are NEVER hardcoded — the map is built from env so the same
// price IDs that back the Payment Links drive provisioning. Set the ones you use.

export type PlanSlug = "free" | "exos_pro" | "apex" | "teams";

export const PLAN_LABEL: Record<PlanSlug, string> = {
  free: "Sovereign (Free)",
  exos_pro: "Exos Pro",
  apex: "Apex",
  teams: "Teams",
};

// Linear capability ladder (pricing: each paid tier includes the one below).
// Used for entitlement checks: a plan "meets" a requirement if it ranks >= it.
export const PLAN_RANK: Record<PlanSlug, number> = {
  free: 0,
  exos_pro: 1,
  apex: 2,
  teams: 3,
};

export function planMeets(current: PlanSlug, required: PlanSlug): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

/**
 * Central entitlements policy — the single place to tune which feature needs
 * which plan. Keys are stable feature ids referenced by <PlanGate feature=…>.
 * Grounded in the published /pricing tiers; adjust here, not in components.
 */
export const ENTITLEMENTS = {
  "integrations.connectors": "exos_pro",   // turnkey connectors + hosted skill sync
  "skills.publish": "exos_pro",            // publish signed skills to the registry
  "skills.full_library": "apex",           // the full federated skill library + RAG
  "mesh.clustering": "exos_pro",           // P2P mesh clustering beyond the free 2 nodes
  "team.seats": "teams",                   // multi-user mesh orchestration + RBAC/SSO
} as const;

export type Feature = keyof typeof ENTITLEMENTS;

export function requiredPlanFor(feature: Feature): PlanSlug {
  return ENTITLEMENTS[feature] as PlanSlug;
}

/**
 * Resolve a Stripe Price ID to a plan slug using env-configured IDs. Returns
 * null when the price isn't recognised (e.g. env not set yet) so callers can
 * decide how to handle it. Server-only env (no NEXT_PUBLIC_) — used in the
 * webhook, which runs on the server.
 */
export function planForPriceId(priceId: string | null | undefined): PlanSlug | null {
  if (!priceId) return null;
  const map: Record<string, PlanSlug> = {};
  const add = (id: string | undefined, slug: PlanSlug) => {
    if (id) map[id] = slug;
  };
  add(process.env.STRIPE_PRICE_EXOS_PRO_MONTHLY, "exos_pro");
  add(process.env.STRIPE_PRICE_EXOS_PRO_ANNUAL, "exos_pro");
  add(process.env.STRIPE_PRICE_APEX_MONTHLY, "apex");
  add(process.env.STRIPE_PRICE_APEX_ANNUAL, "apex");
  add(process.env.STRIPE_PRICE_TEAMS_MONTHLY, "teams");
  add(process.env.STRIPE_PRICE_TEAMS_ANNUAL, "teams");
  return map[priceId] ?? null;
}
