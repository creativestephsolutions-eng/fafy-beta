import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for server-side jobs that must bypass RLS
 * (Stripe webhook writes, daily-cap checks). Never import this in client
 * components — the service-role key must never reach the browser.
 */
export function supabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
