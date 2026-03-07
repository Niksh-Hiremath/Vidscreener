import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/evaluators/[id]/assignments — get assignments for an evaluator
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: evaluatorId } = await params;
  const supabase = getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from('evaluator_assignments')
    .select('*, videos(id, original_filename), projects(id, name)')
    .eq('evaluator_id', evaluatorId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignments: data });
}

// POST /api/evaluators/[id]/assignments — assign a video
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: evaluatorId } = await params;
  const supabase = getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { video_id, project_id, due_date } = await request.json();
  const serviceClient = createSupabaseServiceClient();

  const { data: profile } = await serviceClient.from('users').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await serviceClient.from('evaluator_assignments').insert({
    video_id,
    evaluator_id: evaluatorId,
    project_id,
    assigned_by: user.id,
    due_date,
  }).select().single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Video already assigned to this evaluator' }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignment: data }, { status: 201 });
}
