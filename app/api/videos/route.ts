import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/videos — Admin/Evaluator lists videos
export async function GET(request: NextRequest) {
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data: profile } = await serviceClient.from('users').select('organization_id, role').eq('id', user.id).single();

  let query = serviceClient
    .from('videos')
    .select('*, submissions(submitter_name, submitter_email, form_id), projects!inner(organization_id, name), ai_evaluations(overall_score)');

  if (profile?.role === 'admin') {
    query = query.eq('projects.organization_id', profile.organization_id);
  } else if (profile?.role === 'evaluator') {
    // Evaluators only see videos assigned to them
    const { data: assignments } = await serviceClient.from('evaluator_assignments').select('video_id').eq('evaluator_id', user.id);
    const videoIds = assignments?.map((a: any) => a.video_id) || [];
    if (videoIds.length === 0) {
      return NextResponse.json({ videos: [] });
    }
    query = query.in('id', videoIds);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ videos: data });
}

// POST /api/videos — Register video metadata after MinIO upload
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { project_id, submission_id, original_filename, minio_object_key, mime_type, size_bytes } = body;
  
  const serviceClient = createSupabaseServiceClient();

  if (!project_id || !minio_object_key) {
    return NextResponse.json({ error: 'project_id and minio_object_key are required' }, { status: 400 });
  }

  if (!submission_id) {
    return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
  }

  const { data, error } = await serviceClient.from('videos').insert({
    project_id,
    submission_id,
    original_filename,
    minio_object_key,
    mime_type,
    size_bytes,
    status: 'uploaded'
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ video: data }, { status: 201 });
}
