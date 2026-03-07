import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ─── Client-side (browser) Supabase client ───────────────────────────────────
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ─── Server-side Supabase client (with cookie-based auth) ────────────────────
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Cookies can't be set in Server Components — ignored
          }
        },
      },
    }
  );
}

// ─── Service-role Supabase client (bypasses RLS, server-only) ────────────────
import { createClient } from '@supabase/supabase-js';

export function createSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
