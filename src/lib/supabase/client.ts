import { createBrowserClient } from "@supabase/ssr";

import {
  getSupabasePublishableOrAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

/** Browser-only Supabase client (use in Client Components). */
export function createBrowserSupabaseClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableOrAnonKey();
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL and a public key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
  return createBrowserClient(url, key);
}
