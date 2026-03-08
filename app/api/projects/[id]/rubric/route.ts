import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/projects/[id]/rubric
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from('rubrics')
    .select('*, rubric_criteria(*)')
    .eq('project_id', id)
    .single();

  if (error) return NextResponse.json({ error: 'No rubric found' }, { status: 404 });
  return NextResponse.json({ rubric: data });
}

// PUT /api/projects/[id]/rubric — upsert rubric + replace criteria
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = getSupabaseServerClient(request);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { name, description, criteria } = await request.json();
  if (!name) return NextResponse.json({ error: 'Rubric name required' }, { status: 400 });

  const serviceClient = createSupabaseServiceClient();

  // Upsert rubric
  const { data: rubric, error: rubricError } = await serviceClient
    .from('rubrics')
    .upsert({ project_id: projectId, name, description }, { onConflict: 'project_id' })
    .select()
    .single();

  if (rubricError) return NextResponse.json({ error: rubricError.message }, { status: 500 });

  // Replace criteria
  if (criteria && Array.isArray(criteria)) {
    await serviceClient.from('rubric_criteria').delete().eq('rubric_id', rubric.id);
    if (criteria.length > 0) {
      const criteriaRows = criteria.map((c: { name: string; description: string; max_points: number; weight: number }, idx: number) => ({
        rubric_id: rubric.id,
        name: c.name,
        description: c.description,
        max_points: c.max_points,
        weight: c.weight,
        order_index: idx,
      }));
      await serviceClient.from('rubric_criteria').insert(criteriaRows);
    }
  }

  const { data: fullRubric } = await serviceClient
    .from('rubrics')
    .select('*, rubric_criteria(*)')
    .eq('id', rubric.id)
    .single();

  return NextResponse.json({ rubric: fullRubric });
}
