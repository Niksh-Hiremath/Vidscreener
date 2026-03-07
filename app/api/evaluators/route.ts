import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/evaluators — list evaluators for org
import { NextRequest } from 'next/server';
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id').eq('id', user.id).single();

  const { data, error } = await serviceClient
    .from('users')
    .select('*, evaluator_assignments(count), human_evaluations(count)')
    .eq('organization_id', profile?.organization_id)
    .eq('role', 'evaluator');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ evaluators: data });
}

// POST /api/evaluators — invite an evaluator (creates user + sends email)
export async function POST(request: Request) {
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();

  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email, full_name } = await request.json();

  // Create auth user and send invite email
  const { data: authData, error: authError } = await serviceClient.auth.admin.inviteUserByEmail(email);
  if (authError || !authData.user) return NextResponse.json({ error: authError?.message || 'Failed to send invite' }, { status: 500 });

  // Add to profile
  const { error: profileError } = await serviceClient.from('users').insert({
    id: authData.user.id,
    email,
    full_name,
    role: 'evaluator',
    organization_id: profile.organization_id,
  });

  if (profileError) {
    await serviceClient.auth.admin.deleteUser(authData.user.id);
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Evaluator invited successfully' }, { status: 201 });
}
