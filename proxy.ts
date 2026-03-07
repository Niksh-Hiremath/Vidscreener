import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSupabaseServerClient } from './utils/supabaseServerClient';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = getSupabaseServerClient(request, response);

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  // Redirect unauthenticated users trying to access protected routes
  if (!user) {
    if (pathname.startsWith('/admin') && ["/admin/login", "/admin/register", "/admin/forgot-password"].indexOf(pathname) === -1) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (pathname.startsWith('/evaluator') && ["/evaluator/login", "/evaluator/register", "/evaluator/forgot-password"].indexOf(pathname) === -1) {
      return NextResponse.redirect(new URL('/evaluator/login', request.url));
    }
    return response;
  }

  // Fetch user role from DB
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  const role = profile?.role;

  // Role-based route protection
  if (pathname.startsWith('/admin') && ["/admin/login", "/admin/register", "/admin/forgot-password"].indexOf(pathname) === -1) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  if (pathname.startsWith('/evaluator') && ["/evaluator/login", "/evaluator/register", "/evaluator/forgot-password"].indexOf(pathname) === -1) {
    if (role !== 'evaluator') {
      return NextResponse.redirect(new URL('/evaluator/login', request.url));
    }
  }

  // Redirect already-authenticated users away from login pages
  if (pathname === '/admin/login' && role === 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }
  if (pathname === '/evaluator/login' && role === 'evaluator') {
    return NextResponse.redirect(new URL('/evaluator/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/evaluator/:path*'],
};
