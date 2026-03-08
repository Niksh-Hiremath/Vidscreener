import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

// GET /api/auth/me — get current authenticated user's profile
export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const supabase = createSupabaseServiceClient();

  // Verify the token and get the user
  const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // Fetch profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  // Fetch org
  let orgName = null;
  let orgSecretKey = null;
  if (profile.organization_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name, org_secret_key')
      .eq('id', profile.organization_id)
      .single();
    orgName = org?.name;
    if (profile.role === 'admin') {
      orgSecretKey = org?.org_secret_key;
    }
  }

  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      organization_id: profile.organization_id,
      organization_name: orgName,
      org_secret_key: orgSecretKey,
      created_at: profile.created_at,
    },
  });
}
