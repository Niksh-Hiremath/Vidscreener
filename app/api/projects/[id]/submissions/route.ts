import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/projects/[id]/submissions
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from('submissions')
    .select('*, videos(id, original_filename, status, minio_object_key), documents(id, original_filename)')
    .eq('project_id', projectId)
    .order('submitted_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ submissions: data });
}
