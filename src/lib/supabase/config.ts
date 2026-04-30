/** Project URL, e.g. https://xyzcompany.supabase.co */
export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

/**
 * Public client key: prefer new publishable key name, fall back to legacy anon key.
 * Either value works with @supabase/ssr — use what your dashboard shows.
 */
export function getSupabasePublishableOrAnonKey(): string | undefined {
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return publishable || anon || undefined;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabasePublishableOrAnonKey());
}
