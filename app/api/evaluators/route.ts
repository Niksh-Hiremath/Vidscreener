import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/evaluators — list evaluators for org
export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();

  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Get evaluators with assignment and evaluation counts
  const { data, error } = await serviceClient
    .from('users')
    .select('id, full_name, email, avatar_url, created_at, evaluator_assignments!evaluator_assignments_evaluator_id_fkey(count), human_evaluations(count)')
    .eq('organization_id', profile?.organization_id)
    .eq('role', 'evaluator');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Compute active status: evaluator is active if they have pending assignments
  const evaluatorsWithStatus = await Promise.all((data || []).map(async (e: any) => {
    const { count } = await serviceClient
      .from('evaluator_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('evaluator_id', e.id)
      .eq('status', 'pending');
    
    // Get avg review time
    const { data: evals } = await serviceClient
      .from('human_evaluations')
      .select('time_spent_seconds')
      .eq('evaluator_id', e.id);
    
    let avgTime = 0;
    if (evals && evals.length > 0) {
      const totalTime = evals.reduce((sum: number, ev: any) => sum + (ev.time_spent_seconds || 0), 0);
      avgTime = Math.round(totalTime / evals.length / 60 * 10) / 10; // in minutes
    }

    // Get distinct projects
    const { data: assignments } = await serviceClient
      .from('evaluator_assignments')
      .select('project_id')
      .eq('evaluator_id', e.id);
    const distinctProjects = new Set(assignments?.map((a: any) => a.project_id) || []);

    return {
      ...e,
      active: (count || 0) > 0,
      avg_review_time: avgTime,
      distinct_project_count: distinctProjects.size,
    };
  }));

  return NextResponse.json({ evaluators: evaluatorsWithStatus });
}

// DELETE not POST for removing evaluators
export async function DELETE(request: NextRequest) {
  const accessToken = request.cookies.get('sb-access-token')?.value;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: { user } } = await serviceClient.auth.getUser(accessToken);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { evaluator_id } = await request.json();
  if (!evaluator_id) return NextResponse.json({ error: 'evaluator_id required' }, { status: 400 });

  // Verify evaluator belongs to same org
  const { data: evaluator } = await serviceClient.from('users').select('organization_id').eq('id', evaluator_id).single();
  if (evaluator?.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: 'Evaluator not in your organization' }, { status: 403 });
  }

  // Delete evaluator assignments first
  await serviceClient.from('evaluator_assignments').delete().eq('evaluator_id', evaluator_id);
  // Delete human evaluations
  await serviceClient.from('human_evaluations').delete().eq('evaluator_id', evaluator_id);
  // Delete from users table
  await serviceClient.from('users').delete().eq('id', evaluator_id);
  // Delete from auth
  await serviceClient.auth.admin.deleteUser(evaluator_id);

  return NextResponse.json({ message: 'Evaluator removed' });
}
