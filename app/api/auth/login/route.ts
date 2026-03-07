import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    return NextResponse.json({ error: error?.message || 'Invalid credentials' }, { status: 401 });
  }

  // Fetch user role from profile table
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name, organization_id')
    .eq('id', data.user.id)
    .single();

  // Set session cookie so SSR middleware can read it
  const cookieStore = await cookies();
  cookieStore.set('sb-access-token', data.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: data.session.expires_in,
    path: '/',
  });
  cookieStore.set('sb-refresh-token', data.session.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role,
      full_name: profile?.full_name,
      organization_id: profile?.organization_id,
    },
    session: {
      access_token: data.session.access_token,
      expires_in: data.session.expires_in,
    },
  });
}
