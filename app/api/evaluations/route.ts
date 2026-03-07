import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// POST /api/evaluations — submit a human evaluation
export async function POST(request: Request) {
  const supabase = getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { video_id, rubric_id, criteria_scores, overall_score, notes, time_spent_seconds, override_ai } = await request.json();

  const serviceClient = createSupabaseServiceClient();

  // Validate evaluator is assigned to this video
  const { data: assignment } = await serviceClient.from('evaluator_assignments')
    .select('id')
    .eq('video_id', video_id)
    .eq('evaluator_id', user.id)
    .single();

  if (!assignment) return NextResponse.json({ error: 'Not assigned to this video' }, { status: 403 });

  // 1. Insert Human Evaluation record
  const { data: evaluation, error: evalError } = await serviceClient.from('human_evaluations').insert({
    video_id,
    evaluator_id: user.id,
    rubric_id,
    overall_score,
    notes,
    override_ai,
    time_spent_seconds,
  }).select().single();

  if (evalError) return NextResponse.json({ error: evalError.message }, { status: 500 });

  // 2. Insert array of criteria scores
  if (criteria_scores && Array.isArray(criteria_scores)) {
    const scoreRows = criteria_scores.map((c) => ({
      human_evaluation_id: evaluation.id,
      criterion_id: c.criterion_id,
      score: c.score,
      notes: c.notes || null,
    }));
    await serviceClient.from('human_criteria_scores').insert(scoreRows);
  }

  // 3. Mark video as 'ready'/evaluated
  await serviceClient.from('videos').update({ status: 'ready' }).eq('id', video_id);

  return NextResponse.json({ evaluation }, { status: 201 });
}
