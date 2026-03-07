import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/projects — list projects for the authenticated org
export async function GET(request: NextRequest, response: NextResponse) {
  const supabase = getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id').eq('id', user.id).single();

  const { data, error } = await serviceClient
    .from('projects')
    .select(`
      *,
      rubrics(id, name),
      submission_forms(id, title, is_active),
      submissions(count),
      evaluator_assignments(count)
    `)
    .eq('organization_id', profile?.organization_id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data });
}

// POST /api/projects — create a new project
export async function POST(request: NextRequest, response: NextResponse) {
  const supabase = await getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description } = await request.json();
  if (!name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await serviceClient.from('projects').insert({
    name,
    description,
    organization_id: profile.organization_id,
    created_by: user.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ project: data }, { status: 201 });
}
