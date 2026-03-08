import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/evaluators/[id]/assignments — get assignments for an evaluator
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: evaluatorId } = await params;
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data, error } = await serviceClient
    .from('evaluator_assignments')
    .select('*, videos(id, original_filename, status), projects(id, name)')
    .eq('evaluator_id', evaluatorId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignments: data });
}

// POST /api/evaluators/[id]/assignments — assign videos to evaluator
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: evaluatorId } = await params;
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const serviceClient = createSupabaseServiceClient();

  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await serviceClient.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Support both single and batch assignment
  const { video_id, video_ids, project_id, due_date } = body;
  const idsToAssign = video_ids || (video_id ? [video_id] : []);

  if (idsToAssign.length === 0 || !project_id) {
    return NextResponse.json({ error: 'video_id(s) and project_id required' }, { status: 400 });
  }

  const rows = idsToAssign.map((vid: string) => ({
    video_id: vid,
    evaluator_id: evaluatorId,
    project_id,
    assigned_by: user.id,
    due_date: due_date || null,
    status: 'pending',
  }));

  const { data, error } = await serviceClient
    .from('evaluator_assignments')
    .insert(rows)
    .select();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Some videos already assigned to this evaluator' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignments: data }, { status: 201 });
}

// DELETE /api/evaluators/[id]/assignments — remove assignments
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: evaluatorId } = await params;
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await serviceClient.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { assignment_id, project_id } = await request.json();

  if (assignment_id) {
    await serviceClient.from('evaluator_assignments').delete().eq('id', assignment_id);
  } else if (project_id) {
    // Remove all assignments for this evaluator from this project
    await serviceClient.from('evaluator_assignments').delete().eq('evaluator_id', evaluatorId).eq('project_id', project_id);
  }

  return NextResponse.json({ message: 'Assignments removed' });
}
