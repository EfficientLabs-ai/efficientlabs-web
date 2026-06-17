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
