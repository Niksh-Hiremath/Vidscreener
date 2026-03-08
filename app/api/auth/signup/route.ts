import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function POST(request: Request) {
  const { email, password, full_name, role, organization_name, org_secret_key } = await request.json();

  if (!email || !password || !full_name || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['admin', 'evaluator', 'submitter'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const supabase = createSupabaseServiceClient();

  let organizationId: string | null = null;

  if (role === 'admin') {
    // Admin signup: create a new organization
    const orgName = organization_name || `${full_name}'s Organization`;
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug })
      .select()
      .single();

    if (orgError) {
      return NextResponse.json({ error: `Failed to create organization: ${orgError.message}` }, { status: 500 });
    }
    organizationId = org.id;
  } else if (role === 'evaluator' || role === 'submitter') {
    // Evaluators and submitters must provide an org_secret_key to join an organization
    if (!org_secret_key) {
      return NextResponse.json({ error: 'Organization secret key is required for evaluator/submitter signup' }, { status: 400 });
    }

    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id')
      .eq('org_secret_key', org_secret_key)
      .single();

    if (orgError || !org) {
      return NextResponse.json({ error: 'Invalid organization secret key' }, { status: 400 });
    }
    organizationId = org.id;
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message || 'Signup failed' }, { status: 400 });
  }

  // Insert into users table
  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    full_name,
    role,
    organization_id: organizationId,
  });

  if (profileError) {
    // Rollback: delete the auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({
    user: { id: authData.user.id, email, full_name, role, organization_id: organizationId },
  }, { status: 201 });
}
