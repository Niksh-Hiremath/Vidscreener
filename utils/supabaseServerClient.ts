import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

export function getSupabaseServerClient(request: NextRequest, response?: any) {
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					if (response) {
						cookiesToSet.forEach(({ name, value, options }) => {
							request.cookies.set(name, value);
							response.cookies.set(name, value, options);
						});
					}
				},
			},
      global: {
        headers: {
          Authorization: `Bearer ${request.cookies.get('sb-access-token')?.value || ''}`,
        }
      }
		}
	);
}
