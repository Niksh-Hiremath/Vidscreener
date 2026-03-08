import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/analytics — dashboard metrics
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();

  if (!profile?.organization_id) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  // Total projects
  const { count: projectsCount } = await serviceClient
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', profile.organization_id);

  // Total submissions via projects
  const { data: orgProjects } = await serviceClient
    .from('projects')
    .select('id')
    .eq('organization_id', profile.organization_id);
  const projectIds = orgProjects?.map(p => p.id) || [];

  let submissionsCount = 0;
  let videosCount = 0;
  let evaluationsCompleted = 0;
  let averageScore = 0;
  let totalEvaluators = 0;
  let activeEvaluators = 0;

  if (projectIds.length > 0) {
    const { count: subCount } = await serviceClient
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds);
    submissionsCount = subCount || 0;

    const { count: vidCount } = await serviceClient
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .in('project_id', projectIds);
    videosCount = vidCount || 0;

    // Get evaluations for org projects
    const { data: videoIds } = await serviceClient
      .from('videos')
      .select('id')
      .in('project_id', projectIds);
    const vIds = videoIds?.map(v => v.id) || [];

    if (vIds.length > 0) {
      const { data: evaluations } = await serviceClient
        .from('human_evaluations')
        .select('overall_score')
        .in('video_id', vIds);

      evaluationsCompleted = evaluations?.length || 0;
      if (evaluations && evaluations.length > 0) {
        const total = evaluations.reduce((sum: number, e: any) => sum + Number(e.overall_score || 0), 0);
        averageScore = Math.round((total / evaluations.length) * 10) / 10;
      }
    }
  }

  // Evaluator stats for this org
  if (profile.role === 'admin') {
    const { count: evalCount } = await serviceClient
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)
      .eq('role', 'evaluator');
    totalEvaluators = evalCount || 0;

    // Active evaluators = those with pending assignments
    const { data: evaluators } = await serviceClient
      .from('users')
      .select('id')
      .eq('organization_id', profile.organization_id)
      .eq('role', 'evaluator');
    
    if (evaluators && evaluators.length > 0) {
      for (const ev of evaluators) {
        const { count } = await serviceClient
          .from('evaluator_assignments')
          .select('*', { count: 'exact', head: true })
          .eq('evaluator_id', ev.id)
          .eq('status', 'pending');
        if ((count || 0) > 0) activeEvaluators++;
      }
    }
  }

  return NextResponse.json({
    metrics: [
      { label: 'Total Projects', value: projectsCount || 0, icon: 'FolderKanban' },
      { label: 'Total Submissions', value: submissionsCount, icon: 'FileText' },
      { label: 'Total Videos', value: videosCount, icon: 'Video' },
      { label: 'Evaluations Done', value: evaluationsCompleted, icon: 'CheckCircle' },
      { label: 'Average Score', value: averageScore, icon: 'BarChart' },
      { label: 'Total Evaluators', value: totalEvaluators, icon: 'Users' },
      { label: 'Active Evaluators', value: activeEvaluators, icon: 'UserCheck' },
    ],
  });
}
