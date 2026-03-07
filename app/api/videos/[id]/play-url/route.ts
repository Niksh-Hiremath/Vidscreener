import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';
import { generatePlaybackUrl } from '@/lib/minio';

// GET /api/videos/[id]/play-url
export async function GET(request: Request, response: Response, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient(request, response);
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch the video record to get the minio object name
  const { data: video, error } = await supabase
    .from('videos')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (error || !video) {
    return NextResponse.json({ error: 'Video not found' }, { status: 404 });
  }

  try {
    // Generate a presigned GET URL valid for 1 hour (3600 seconds)
    const presignedUrl = await generatePlaybackUrl(video.storage_path, 3600);

    return NextResponse.json({ url: presignedUrl });
  } catch (err: any) {
    console.error('Error generating presigned URL:', err);
    return NextResponse.json({ error: 'Failed to generate play URL' }, { status: 500 });
  }
}
