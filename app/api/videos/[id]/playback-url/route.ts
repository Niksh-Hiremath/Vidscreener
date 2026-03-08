import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';
import { generatePlaybackUrl } from '@/lib/minio';

// GET /api/videos/[id]/playback-url
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = await params;
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();

  // Validate the user has access to this video
  const { data: profile } = await serviceClient.from('users').select('role, organization_id').eq('id', user.id).single();
  const { data: video, error } = await serviceClient.from('videos').select('minio_object_key, projects(organization_id)').eq('id', videoId).single();

  if (error || !video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  if (profile?.role === 'evaluator') {
    const { data: assignment } = await serviceClient
      .from('evaluator_assignments')
      .select('id')
      .eq('video_id', videoId)
      .eq('evaluator_id', user.id)
      .single();
    if (!assignment) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } else if (profile?.role === 'admin' && (video.projects as any)?.organization_id !== profile.organization_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const playbackUrl = await generatePlaybackUrl(video.minio_object_key, 3600);
    return NextResponse.json({ playbackUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
