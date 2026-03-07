import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/videos — Admin/Evaluator lists videos
export async function GET(request: Request, response: Response) {
  const supabase = await createSupabaseServerClient();
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
    const videoIds = assignments?.map((a) => a.video_id) || [];
    query = query.in('id', videoIds);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ videos: data });
}

// POST /api/videos — Register video metadata after MinIO upload
export async function POST(request: Request) {
  const { project_id, original_filename, minio_object_key, mime_type, size_bytes } = await request.json();
  const serviceClient = createSupabaseServiceClient();

  // Create video record without submission_id (will be linked during form submit)
  // or pass a temporary UUID if your schema strictly requires it right away,
  // but usually it's better to make submission_id nullable or create submission first.
  // Wait, our schema requires submission_id. So the client MUST create submission first
  // OR we alter the schema. Let's fix this in the submit flow — client calls this API
  // WITH a submission_id, or we make submission_id nullable.

  // Assuming the client calls /api/forms/[id]/submit FIRST, which returns a submission,
  // and THEN uploads video and calls this with submission_id.
  const submissionId = (await request.json().catch(()=>({})))?.submission_id;

  if (!project_id || !minio_object_key) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // To handle the strict schema which requires submission_id, we expect it to be passed.
  // We'll update our POST handler to extract it correctly.
  const payload = await request.json().catch(() => ({}));
  const sub_id = payload.submission_id || submissionId;

  if (!sub_id) {
    return NextResponse.json({ error: 'submission_id is required' }, { status: 400 });
  }

  const { data, error } = await serviceClient.from('videos').insert({
    project_id,
    submission_id: sub_id,
    original_filename,
    minio_object_key,
    mime_type,
    size_bytes,
    status: 'uploaded'
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ video: data }, { status: 201 });
}
