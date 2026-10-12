import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 *
 * Returns `null` when the project has not been configured yet. Callers must
 * handle that case so the marketing site still renders while setup is
 * incomplete.
 *
 * In Next.js 16 `cookies()` is asynchronous, hence the `await`.
 */
export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `setAll` is called from a Server Component where cookies are
          // read-only. This is safe to ignore because the session is refreshed
          // by `proxy.ts` on every request.
        }
      },
    },
  });
}
