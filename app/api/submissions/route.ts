import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/submissions — list submissions for the authenticated user
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();

  if (profile?.role === 'admin') {
    // Admin sees all submissions for their org's projects
    const { data: projects } = await serviceClient
      .from('projects')
      .select('id')
      .eq('organization_id', profile.organization_id);
    const projectIds = projects?.map(p => p.id) || [];

    if (projectIds.length === 0) {
      return NextResponse.json({ submissions: [] });
    }

    const { data, error } = await serviceClient
      .from('submissions')
      .select('*, projects(name), submission_forms(title), videos(id, original_filename, status)')
      .in('project_id', projectIds)
      .order('submitted_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ submissions: data });
  } else if (profile?.role === 'submitter') {
    // Submitter sees their own submissions
    const { data, error } = await serviceClient
      .from('submissions')
      .select('*, projects(name), submission_forms(title), videos(id, original_filename, status)')
      .eq('submitted_by', user.id)
      .order('submitted_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ submissions: data });
  }

  return NextResponse.json({ submissions: [] });
}
