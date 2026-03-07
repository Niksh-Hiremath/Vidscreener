import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { getSupabaseServerClient } from '@/utils/supabaseServerClient';

// GET /api/evaluators/me/assignments — get assignments for the logged-in evaluator
export async function GET(request: NextRequest, response: NextResponse) {
  const supabase = getSupabaseServerClient(request, response);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceClient = createSupabaseServiceClient();
  const { data, error } = await serviceClient
    .from('evaluator_assignments')
    .select('*, videos(id, original_filename), projects(id, name)')
    .eq('evaluator_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assignments: data });
}
