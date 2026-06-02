import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Public env — set by the operator at deploy time (Supabase project URL + anon key).
// Until then the client is null and the UI shows an "early access" state instead of
// throwing. The anon key is publishable by design; no secret is handled here.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const authReady = Boolean(url && anon);
export const supabase: SupabaseClient | null = authReady ? createClient(url!, anon!) : null;
