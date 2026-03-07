import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// POST /api/videos/[id]/evaluate — AI Evaluation Trigger
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: videoId } = await params;
  const supabase = getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();

  // 1. Fetch video and attached rubric
  const { data: video, error: videoError } = await serviceClient
    .from('videos')
    .select('project_id')
    .eq('id', videoId)
    .single();

  if (videoError || !video) return NextResponse.json({ error: 'Video not found' }, { status: 404 });

  const { data: rubric } = await serviceClient
    .from('rubrics')
    .select('*, rubric_criteria(*)')
    .eq('project_id', video.project_id)
    .single();

  if (!rubric) return NextResponse.json({ error: 'No rubric for project' }, { status: 400 });

  // 2. STUB: Mock AI evaluation logic (replace with Gemini at mid-sem)
  const mockScore = Math.floor(Math.random() * 20) + 70; // 70-90

  const { data: evaluation, error: evalError } = await serviceClient
    .from('ai_evaluations')
    .insert({
      video_id: videoId,
      rubric_id: rubric.id,
      overall_score: mockScore,
      confidence: 0.85,
      justification: "The candidate clearly demonstrated the project on camera but lacked depth in technical explanation.",
      model_used: "gemini-1.5-pro-stub",
    })
    .select()
    .single();

  if (evalError) return NextResponse.json({ error: evalError.message }, { status: 500 });

  // Mock criteria scores
  if (rubric.rubric_criteria) {
    const criteriaScores = rubric.rubric_criteria.map((c: any) => ({
      ai_evaluation_id: evaluation.id,
      criterion_id: c.id,
      score: Math.min(c.max_points, Math.floor(c.max_points * 0.8)),
      max_score: c.max_points,
      justification: "Met most requirements.",
    }));
    await serviceClient.from('ai_criteria_scores').insert(criteriaScores);
  }

  return NextResponse.json({ message: 'AI evaluation completed', evaluation }, { status: 201 });
}
