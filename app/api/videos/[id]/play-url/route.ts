import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';
import { generatePlaybackUrl } from '@/lib/minio';

// GET /api/videos/[id]/play-url
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: video, error } = await supabase
    .from('videos')
    .select('minio_object_key')
    .eq('id', id)
    .single();

  if (error || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  try {
    const presignedUrl = await generatePlaybackUrl(video.minio_object_key, 3600);
    return NextResponse.json({ url: presignedUrl });
  } catch (err: any) {
    console.error('Error generating presigned URL:', err);
    return NextResponse.json({ error: 'Failed to generate play URL' }, { status: 500 });
  }
}
