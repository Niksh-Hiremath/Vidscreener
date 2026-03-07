import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/analytics — dashboard metrics
export async function GET(request: NextRequest, response: NextResponse) {
  const supabase = await getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase.from('users').select('organization_id, role').eq('id', user.id).single();

  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Total projects
  const { count: projectsCount } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', profile.organization_id);

  // Total submissions
  const { count: submissionsCount } = await supabase
    .from('submissions')
    .select('*, projects!inner(organization_id)', { count: 'exact', head: true })
    .eq('projects.organization_id', profile.organization_id);

  // Average Score
  const { data: evaluations } = await supabase
    .from('human_evaluations')
    .select('overall_score, videos!inner(projects!inner(organization_id))')
    .eq('videos.projects.organization_id', profile.organization_id);

  let averageScore = 0;
  if (evaluations && evaluations.length > 0) {
    const total = evaluations.reduce((sum, e) => sum + Number(e.overall_score || 0), 0);
    averageScore = Math.round((total / evaluations.length) * 10) / 10;
  }

  return NextResponse.json({
    metrics: [
      { label: 'Total Projects', value: projectsCount || 0 },
      { label: 'Total Submissions', value: submissionsCount || 0 },
      { label: 'Average Score', value: averageScore || 0 },
      { label: 'Evaluations Completed', value: evaluations?.length || 0 },
    ],
  });
}
