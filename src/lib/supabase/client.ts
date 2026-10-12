"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Supabase client for Client Components (browser).
 *
 * Only the publishable (anon) key is used, so all access remains subject to
 * Row Level Security. Returns `null` when Supabase is not configured.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  }
  return client;
}
