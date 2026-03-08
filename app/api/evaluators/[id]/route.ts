import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/evaluators/[id] — get evaluator details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: evaluator, error } = await serviceClient
    .from('users')
    .select('id, full_name, email, avatar_url, created_at, evaluator_assignments!evaluator_assignments_evaluator_id_fkey(*, projects(name), videos(original_filename)), human_evaluations(count)')
    .eq('id', id)
    .eq('role', 'evaluator')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ evaluator });
}

// DELETE /api/evaluators/[id] — remove evaluator
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Verify evaluator belongs to same org
  const { data: evaluator } = await serviceClient.from('users').select('organization_id').eq('id', id).single();
  if (evaluator?.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: 'Evaluator not in your organization' }, { status: 403 });
  }

  // Delete evaluator assignments
  await serviceClient.from('evaluator_assignments').delete().eq('evaluator_id', id);
  await serviceClient.from('human_evaluations').delete().eq('evaluator_id', id);
  await serviceClient.from('users').delete().eq('id', id);
  await serviceClient.auth.admin.deleteUser(id);

  return NextResponse.json({ message: 'Evaluator removed' });
}
