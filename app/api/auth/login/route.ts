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
    .select('role, full_name, organization_id, avatar_url')
    .eq('id', data.user.id)
    .single();

  // Fetch org name
  let orgName = null;
  if (profile?.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', profile.organization_id)
      .single();
    orgName = org?.name;
  }

  // Set session cookies
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
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  // Determine redirect URL based on role
  let redirectUrl = '/';
  if (profile?.role === 'admin') redirectUrl = '/admin/dashboard';
  else if (profile?.role === 'evaluator') redirectUrl = '/evaluator/dashboard';
  else if (profile?.role === 'submitter') redirectUrl = '/submit/dashboard';

  return NextResponse.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile?.role,
      full_name: profile?.full_name,
      organization_id: profile?.organization_id,
      organization_name: orgName,
      avatar_url: profile?.avatar_url,
    },
    session: {
      access_token: data.session.access_token,
      expires_in: data.session.expires_in,
    },
    redirectUrl,
  });
}
