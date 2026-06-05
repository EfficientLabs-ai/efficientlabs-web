"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, authReady } from "@/lib/supabase";

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
};

export function useOsSession(): OsSession {
  const [email, setEmail] = useState<string | null>(null);
  // When Supabase isn't configured the client is null and there is nothing to
  // resolve — we're "ready" (signed-out preview) from the first render, which
  // also avoids a synchronous setState inside the effect.
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setReady(true);
    });
  }, []);

  return { email, signedIn: Boolean(email), ready, authReady };
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
