import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Cheap check: does the request carry a Supabase auth cookie at all?
 *
 * `@supabase/ssr` stores the session in a cookie named `sb-<ref>-auth-token`
 * (possibly chunked as `.0`, `.1`, ...). This lets us skip the network call to
 * `getUser()` for the 99.9% of visitors who are not signed in.
 */
export async function hasAuthCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .some((cookie) => cookie.name.includes("-auth-token"));
}

/**
 * Resolve the current user once per request.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { supabase: null, user: null } as const;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user } as const;
});

/**
 * Membership in the `admins` table is the single source of truth for
 * authorization. Hiding UI is never sufficient; RLS enforces the same rule in
 * the database.
 */
export const isCurrentUserAdmin = cache(async () => {
  const { supabase, user } = await getCurrentUser();
  if (!supabase || !user) return false;
  const { data, error } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
});

/**
 * Server-side guard for admin pages. Redirects unauthenticated visitors to the
 * login screen.
 */
export async function requireAdmin() {
  if (!isSupabaseConfigured) {
    redirect("/admin/login?config=missing");
  }
  const { user } = await getCurrentUser();
  if (!user) {
    redirect("/admin/login");
  }
  const admin = await isCurrentUserAdmin();
  if (!admin) {
    redirect("/admin/unauthorized");
  }
  return user;
}

/**
 * Guard for Server Actions and data access that must not run for anonymous
 * callers. Throws instead of redirecting so the failure surface is explicit.
 */
export async function requireAdminOrThrow() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase non configurato. Imposta NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  const { supabase, user } = await getCurrentUser();
  if (!supabase || !user) {
    throw new Error("Accesso non autorizzato.");
  }
  const admin = await isCurrentUserAdmin();
  if (!admin) {
    throw new Error("Accesso non autorizzato.");
  }
  return { supabase, user };
}

/** Requires an authenticated user (not necessarily an admin). */
export async function requireUserOrThrow() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase non configurato.");
  }
  const { supabase, user } = await getCurrentUser();
  if (!supabase || !user) {
    throw new Error("Accesso non autorizzato.");
  }
  return { supabase, user };
}
