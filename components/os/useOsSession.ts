"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, authReady } from "@/lib/supabase";
import type { PlanSlug } from "@/lib/plans";

/**
 * Single source of auth truth for the Atmosphere OS shell + every module.
 * Mirrors the exact pattern used by /dashboard so behaviour is identical:
 * when Supabase is not configured the client is null and we degrade to a
 * signed-out preview (never throw). `ready` flips once we know the answer.
 */
export type OsSession = {
  email: string | null;
  signedIn: boolean;
  ready: boolean;
  authReady: boolean;
  plan: PlanSlug;
};

export function useOsSession(): OsSession {
  const [email, setEmail] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanSlug>("free");
  // When Supabase isn't configured the client is null and there is nothing to
  // resolve — we're "ready" (signed-out preview) from the first render, which
  // also avoids a synchronous setState inside the effect.
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    client.auth.getUser().then(async ({ data }) => {
      const userEmail = data.user?.email ?? null;
      setEmail(userEmail);
      // Read plan state from the app server, which verifies the auth token and
      // queries owner-controlled Postgres. Billing data is never read directly
      // from the browser.
      if (userEmail) {
        const { data: sessionData } = await client.auth.getSession();
        const token = sessionData.session?.access_token;
        if (token) {
          try {
            const res = await fetch("/api/account/plan", {
              headers: { authorization: `Bearer ${token}` },
            });
            const account = (await res.json()) as { plan?: PlanSlug };
            if (account.plan) setPlan(account.plan);
          } catch {
            setPlan("free");
          }
        }
      }
      setReady(true);
    });
  }, []);

  return { email, signedIn: Boolean(email), ready, authReady, plan };
}

/**
 * Context so module pages can read the same session the shell resolved, without
 * each page mounting its own getUser() call. OsShell provides it; pages consume
 * via useOs(). Falls back to a fresh hook if used outside the shell.
 */
const OsSessionContext = createContext<OsSession | null>(null);
export const OsSessionProvider = OsSessionContext.Provider;

export function useOs(): OsSession {
  const ctx = useContext(OsSessionContext);
  // Hooks must be called unconditionally; useOsSession is a no-op fallback only
  // when there is no provider (e.g. a page rendered outside the shell).
  const fallback = useOsSession();
  return ctx ?? fallback;
}
