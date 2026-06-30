"use client";
import { createContext, useContext, useEffect, useState } from "react";
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
  const [authReady, setAuthReady] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function resolveSession() {
      try {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        const session = await sessionRes.json() as {
          authReady?: boolean;
          email?: string | null;
          signedIn?: boolean;
        };
        if (cancelled) return;
        setAuthReady(session.authReady !== false);
        const userEmail = session.signedIn ? session.email ?? null : null;
        setEmail(userEmail);

        if (userEmail) {
          const planRes = await fetch("/api/account/plan", { cache: "no-store" });
          const account = await planRes.json() as { plan?: PlanSlug };
          if (!cancelled && account.plan) setPlan(account.plan);
        }
      } catch {
        if (!cancelled) setAuthReady(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    void resolveSession();
    return () => {
      cancelled = true;
    };
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
